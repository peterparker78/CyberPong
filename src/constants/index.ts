// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Paddle configuration
export const PADDLE_WIDTH = 15;
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 8;
export const PADDLE_MARGIN = 30; // Distance from edge
export const PADDLE_EXTENDED_MULTIPLIER = 1.5;

// Ball configuration
export const BALL_RADIUS = 10;
export const INITIAL_BALL_SPEED = 6;
export const BALL_SPEED_MAX = 15;
export const BALL_ACCELERATION = 1.05; // 5% faster on each paddle hit
export const BALL_TRAIL_LENGTH = 10;

// Scoring
export const WINNING_SCORE = 11;

// AI configuration
export const AI_BASE_SPEED = 4;
export const AI_SPEED_INCREMENT = 0.3; // Per difficulty level
export const AI_BASE_REACTION_DELAY = 200; // ms
export const AI_REACTION_DELAY_DECREMENT = 15; // ms per player score
export const AI_MIN_REACTION_DELAY = 50; // ms
export const AI_ERROR_MARGIN_BASE = 50; // pixels
export const AI_ERROR_MARGIN_DECREMENT = 5; // per difficulty level

// Power-up configuration
export const POWERUP_SPAWN_INTERVAL_MIN = 8000; // ms
export const POWERUP_SPAWN_INTERVAL_MAX = 13000; // ms
export const POWERUP_RADIUS = 20;
export const POWERUP_DURATION = 10000; // ms for Long Paddle
export const GHOST_BALL_DURATION = 1000; // ms
export const POWERUP_SPAWN_AREA = {
  xMin: CANVAS_WIDTH / 2 - 75,
  xMax: CANVAS_WIDTH / 2 + 75,
  yMin: 100,
  yMax: CANVAS_HEIGHT - 100,
};

// Visual effects
export const SCREEN_SHAKE_INTENSITY = 8;
export const SCREEN_SHAKE_DURATION = 150; // ms
export const GLITCH_DURATION = 300; // ms
export const PARTICLE_MAX_LIFE = 0.5; // seconds
export const PARTICLE_BASE_SIZE = 4;

// Colors
export const COLORS = {
  cyan: '#00ffff',
  magenta: '#ff00ff',
  yellow: '#ffff00',
  red: '#ff0044',
  green: '#00ff88',
  purple: '#aa00ff',
  white: '#ffffff',
  background: '#0a0a0f',
  surface: '#12121a',
  grid: 'rgba(0, 255, 255, 0.1)',
};

// Power-up colors
export const POWERUP_COLORS: Record<string, string> = {
  LONG_PADDLE: COLORS.green,
  DOUBLE_BALL: COLORS.yellow,
  GHOST_BALL: COLORS.purple,
};

// Frame timing
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms
