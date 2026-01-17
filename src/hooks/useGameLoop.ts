import { useRef, useEffect, useCallback, useState } from 'react';
import type {
  GameState,
  Paddle,
  InputDirection,
  UseGameLoopReturn,
  CollisionResult,
} from '../types/game';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_SPEED,
  BALL_RADIUS,
  INITIAL_BALL_SPEED,
  WINNING_SCORE,
  AI_BASE_REACTION_DELAY,
} from '../constants';
import {
  updateBallPhysics,
  updatePlayerPaddle,
  reflectBallOffPaddle,
  reflectBallOffWall,
  createBall,
} from '../engine/physics';
import { checkCollisions } from '../engine/collision';
import { updateAI } from '../engine/ai';
import { updatePowerUps, applyPowerUp, initPowerUpTimer } from '../engine/powerups';
import { updateParticles, createBounceParticles, createPaddleHitParticles } from '../rendering/particles';
import { triggerScreenShake, triggerGlitchEffect, updateScreenShake, updateGlitchEffect } from '../rendering/effects';
import { render } from '../rendering/canvas';

/**
 * Create initial paddle
 */
function createPaddle(x: number): Paddle {
  return {
    position: { x, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    baseHeight: PADDLE_HEIGHT,
    isExtended: false,
    extendedEndTime: null,
  };
}

/**
 * Create initial game state
 */
function createInitialState(): GameState {
  return {
    status: 'idle',
    balls: [createBall(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, INITIAL_BALL_SPEED)],
    playerPaddle: createPaddle(PADDLE_MARGIN),
    aiPaddle: createPaddle(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH),
    playerScore: 0,
    aiScore: 0,
    winningScore: WINNING_SCORE,
    activePowerUps: [],
    nextPowerUpSpawn: initPowerUpTimer(),
    particles: [],
    screenShake: { active: false, intensity: 0, duration: 0, startTime: 0 },
    glitchEffect: { active: false, duration: 0, startTime: 0 },
    aiDifficulty: 1,
    aiReactionDelay: AI_BASE_REACTION_DELAY,
    aiLastBallPosition: null,
    aiTargetY: CANVAS_HEIGHT / 2,
    lastFrameTime: 0,
    deltaTime: 16.67,
  };
}

/**
 * Handle collision results
 */
function handleCollisions(
  state: GameState,
  results: CollisionResult[]
): { playerScored: boolean; aiScored: boolean } {
  let playerScored = false;
  let aiScored = false;

  for (const result of results) {
    switch (result.type) {
      case 'wall_top':
        reflectBallOffWall(result.ball, true);
        triggerScreenShake(state, 6);
        state.particles.push(...createBounceParticles(result.ball.position.x, 0, true));
        break;

      case 'wall_bottom':
        reflectBallOffWall(result.ball, false);
        triggerScreenShake(state, 6);
        state.particles.push(...createBounceParticles(result.ball.position.x, CANVAS_HEIGHT, true));
        break;

      case 'paddle_player':
        reflectBallOffPaddle(result.ball, state.playerPaddle);
        state.particles.push(
          ...createPaddleHitParticles(
            state.playerPaddle.position.x + PADDLE_WIDTH,
            result.ball.position.y,
            true
          )
        );
        break;

      case 'paddle_ai':
        reflectBallOffPaddle(result.ball, state.aiPaddle);
        state.particles.push(
          ...createPaddleHitParticles(
            state.aiPaddle.position.x,
            result.ball.position.y,
            false
          )
        );
        break;

      case 'powerup':
        if (result.target && 'type' in result.target) {
          applyPowerUp(state, result.target, result.ball);
        }
        break;

      case 'score_left':
        playerScored = true;
        break;

      case 'score_right':
        aiScored = true;
        break;
    }
  }

  return { playerScored, aiScored };
}

/**
 * Handle scoring
 */
function handleScoring(
  state: GameState,
  playerScored: boolean,
  aiScored: boolean
): void {
  if (playerScored) {
    state.playerScore++;
    triggerGlitchEffect(state);
  }
  if (aiScored) {
    state.aiScore++;
    triggerGlitchEffect(state);
  }

  // Check for game over
  if (state.playerScore >= state.winningScore || state.aiScore >= state.winningScore) {
    state.status = 'gameover';
    return;
  }

  // Remove scored balls and reset if needed
  if (playerScored || aiScored) {
    // Filter out balls that scored
    state.balls = state.balls.filter(
      (ball) =>
        ball.position.x > -BALL_RADIUS * 2 &&
        ball.position.x < CANVAS_WIDTH + BALL_RADIUS * 2
    );

    // If no balls left, spawn a new one
    if (state.balls.length === 0) {
      const direction = playerScored ? -1 : 1; // Ball goes toward scorer
      state.balls.push(
        createBall(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, INITIAL_BALL_SPEED, direction)
      );
    }
  }
}

/**
 * Main game loop hook
 */
export function useGameLoop(): UseGameLoopReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const animationFrameRef = useRef<number | null>(null);
  const playerInputRef = useRef<InputDirection>(null);

  // Reactive state for UI updates
  const [reactiveState, setReactiveState] = useState<GameState>(gameStateRef.current);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    const state = gameStateRef.current;

    // Calculate delta time
    const deltaTime = state.lastFrameTime ? timestamp - state.lastFrameTime : 16.67;
    state.lastFrameTime = timestamp;
    state.deltaTime = Math.min(deltaTime, 50); // Cap to prevent physics explosions

    // Always render (even when paused/idle)
    render(canvasRef.current, state);

    if (state.status === 'playing') {
      // 1. Update player paddle
      updatePlayerPaddle(
        state.playerPaddle,
        playerInputRef.current,
        PADDLE_SPEED,
        state.deltaTime
      );

      // 2. Update AI
      updateAI(state, state.deltaTime);

      // 3. Update ball physics
      for (const ball of state.balls) {
        updateBallPhysics(ball, state.deltaTime);
      }

      // 4. Check collisions
      const collisionResults = checkCollisions(state);
      const { playerScored, aiScored } = handleCollisions(state, collisionResults);

      // 5. Handle scoring
      if (playerScored || aiScored) {
        handleScoring(state, playerScored, aiScored);
      }

      // 6. Update power-ups
      updatePowerUps(state);

      // 7. Update particles
      state.particles = updateParticles(state.particles, state.deltaTime);

      // 8. Update effects
      updateScreenShake(state.screenShake);
      updateGlitchEffect(state.glitchEffect);
    }

    // Update reactive state for UI (every few frames)
    setReactiveState({ ...state });

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start animation loop on mount
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Game control functions
  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    if (state.status === 'idle' || state.status === 'gameover') {
      // Reset state
      Object.assign(state, createInitialState());
      state.status = 'playing';
    } else if (state.status === 'paused') {
      state.status = 'playing';
    }
  }, []);

  const pauseGame = useCallback(() => {
    const state = gameStateRef.current;
    if (state.status === 'playing') {
      state.status = 'paused';
    } else if (state.status === 'paused') {
      state.status = 'playing';
    }
  }, []);

  const resetGame = useCallback(() => {
    Object.assign(gameStateRef.current, createInitialState());
  }, []);

  const setPlayerInput = useCallback((direction: InputDirection) => {
    playerInputRef.current = direction;
  }, []);

  return {
    gameState: reactiveState,
    canvasRef,
    startGame,
    pauseGame,
    resetGame,
    setPlayerInput,
  };
}
