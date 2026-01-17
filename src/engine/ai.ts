import type { Ball, GameState, Vector2D } from '../types/game';
import {
  FRAME_TIME,
  CANVAS_HEIGHT,
  AI_BASE_SPEED,
  AI_SPEED_INCREMENT,
  AI_BASE_REACTION_DELAY,
  AI_REACTION_DELAY_DECREMENT,
  AI_MIN_REACTION_DELAY,
  AI_ERROR_MARGIN_BASE,
  AI_ERROR_MARGIN_DECREMENT,
} from '../constants';

/**
 * Get the ball that the AI should track (moving toward AI paddle)
 */
function getTargetBall(balls: Ball[]): Ball | null {
  // Find balls moving toward AI (positive X velocity)
  const approachingBalls = balls.filter((b) => b.velocity.x > 0);

  if (approachingBalls.length === 0) {
    // If no balls approaching, track the closest ball
    return balls.reduce((closest, ball) =>
      ball.position.x > (closest?.position.x ?? -Infinity) ? ball : closest
    , balls[0]) || null;
  }

  // Track the ball closest to the AI paddle
  return approachingBalls.reduce((closest, ball) =>
    ball.position.x > closest.position.x ? ball : closest
  );
}

/**
 * Predict where the ball will be at a given X position
 * Accounts for wall bounces
 */
function predictBallYAtX(
  position: Vector2D,
  velocity: Vector2D,
  targetX: number
): number {
  if (velocity.x <= 0) return position.y;

  const timeToReach = (targetX - position.x) / velocity.x;
  let predictedY = position.y + velocity.y * timeToReach;

  // Account for wall bounces
  let bounces = 0;
  const maxBounces = 10; // Safety limit

  while ((predictedY < 0 || predictedY > CANVAS_HEIGHT) && bounces < maxBounces) {
    if (predictedY < 0) {
      predictedY = -predictedY;
    } else if (predictedY > CANVAS_HEIGHT) {
      predictedY = 2 * CANVAS_HEIGHT - predictedY;
    }
    bounces++;
  }

  // Clamp to valid range
  return Math.max(0, Math.min(CANVAS_HEIGHT, predictedY));
}

/**
 * Apply reaction delay by interpolating between old and current position
 */
function getDelayedPosition(
  currentPosition: Vector2D,
  lastKnownPosition: Vector2D | null,
  delayFactor: number
): Vector2D {
  if (!lastKnownPosition) return currentPosition;

  return {
    x: lastKnownPosition.x + (currentPosition.x - lastKnownPosition.x) * (1 - delayFactor),
    y: lastKnownPosition.y + (currentPosition.y - lastKnownPosition.y) * (1 - delayFactor),
  };
}

/**
 * Update AI paddle position and difficulty
 */
export function updateAI(state: GameState, deltaTime: number): void {
  const { aiPaddle, balls, playerScore } = state;

  // Update AI difficulty based on player score
  state.aiDifficulty = 1 + playerScore * 0.15;

  // Update reaction delay (decreases as player scores more)
  state.aiReactionDelay = Math.max(
    AI_MIN_REACTION_DELAY,
    AI_BASE_REACTION_DELAY - playerScore * AI_REACTION_DELAY_DECREMENT
  );

  // Get target ball
  const targetBall = getTargetBall(balls);
  if (!targetBall) return;

  // Calculate delay factor (0 = no delay, 1 = full delay)
  const delayFactor = Math.min(1, state.aiReactionDelay / 200);

  // Get delayed ball position (simulates reaction time)
  const delayedPosition = getDelayedPosition(
    targetBall.position,
    state.aiLastBallPosition,
    delayFactor
  );

  // Store current position for next frame
  state.aiLastBallPosition = { ...targetBall.position };

  // Predict where ball will intersect AI paddle's X position
  const predictedY = predictBallYAtX(
    delayedPosition,
    targetBall.velocity,
    aiPaddle.position.x
  );

  // Add some randomness/error to make AI imperfect
  const errorMargin = Math.max(
    10,
    AI_ERROR_MARGIN_BASE - state.aiDifficulty * AI_ERROR_MARGIN_DECREMENT
  );
  const error = (Math.random() - 0.5) * errorMargin;
  const targetY = predictedY + error;

  // Smoothly update target
  state.aiTargetY = state.aiTargetY * 0.8 + targetY * 0.2;

  // Calculate AI speed based on difficulty
  const aiSpeed = AI_BASE_SPEED + state.aiDifficulty * AI_SPEED_INCREMENT;
  const dtFactor = deltaTime / FRAME_TIME;
  const maxMovement = aiSpeed * dtFactor;

  // Move paddle toward target
  const paddleCenter = aiPaddle.position.y + aiPaddle.height / 2;
  const distanceToTarget = state.aiTargetY - paddleCenter;

  if (Math.abs(distanceToTarget) > 5) {
    const movement = Math.sign(distanceToTarget) * Math.min(maxMovement, Math.abs(distanceToTarget));
    aiPaddle.position.y += movement;
  }

  // Clamp paddle to canvas bounds
  aiPaddle.position.y = Math.max(
    0,
    Math.min(CANVAS_HEIGHT - aiPaddle.height, aiPaddle.position.y)
  );
}
