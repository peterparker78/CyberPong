// Core geometry types
export interface Vector2D {
  x: number;
  y: number;
}

// Ball entity
export interface Ball {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  isGhost: boolean;
  ghostEndTime: number | null;
  trail: Vector2D[];
}

// Paddle entity
export interface Paddle {
  position: Vector2D;
  width: number;
  height: number;
  baseHeight: number;
  isExtended: boolean;
  extendedEndTime: number | null;
}

// Power-up types
export type PowerUpType = 'LONG_PADDLE' | 'DOUBLE_BALL' | 'GHOST_BALL';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Vector2D;
  spawnTime: number;
  collected: boolean;
}

// Particle for visual effects
export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

// Screen shake effect state
export interface ScreenShake {
  active: boolean;
  intensity: number;
  duration: number;
  startTime: number;
}

// Glitch effect state
export interface GlitchEffect {
  active: boolean;
  duration: number;
  startTime: number;
}

// Game status
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

// Complete game state
export interface GameState {
  status: GameStatus;

  // Core game objects
  balls: Ball[];
  playerPaddle: Paddle;
  aiPaddle: Paddle;

  // Scoring
  playerScore: number;
  aiScore: number;
  winningScore: number;

  // Power-ups
  activePowerUps: PowerUp[];
  nextPowerUpSpawn: number;

  // Visual effects
  particles: Particle[];
  screenShake: ScreenShake;
  glitchEffect: GlitchEffect;

  // AI state
  aiDifficulty: number;
  aiReactionDelay: number;
  aiLastBallPosition: Vector2D | null;
  aiTargetY: number;

  // Timing
  lastFrameTime: number;
  deltaTime: number;
}

// Collision detection result
export type CollisionType =
  | 'paddle_player'
  | 'paddle_ai'
  | 'wall_top'
  | 'wall_bottom'
  | 'powerup'
  | 'score_left'
  | 'score_right';

export interface CollisionResult {
  type: CollisionType;
  ball: Ball;
  target?: Paddle | PowerUp;
}

// Input state
export type InputDirection = 'up' | 'down' | null;

// Hook return type
export interface UseGameLoopReturn {
  gameState: GameState;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  setPlayerInput: (direction: InputDirection) => void;
}
