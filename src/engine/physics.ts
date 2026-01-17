import type { Ball, Paddle } from '../types/game';
import {
  FRAME_TIME,
  BALL_SPEED_MAX,
  BALL_ACCELERATION,
  BALL_TRAIL_LENGTH,
  CANVAS_HEIGHT,
} from '../constants';

/**
 * Update ball position based on velocity and delta time
 */
export function updateBallPhysics(ball: Ball, deltaTime: number): void {
  // Normalize deltaTime to 60fps baseline
  const dtFactor = deltaTime / FRAME_TIME;

  // Update position
  ball.position.x += ball.velocity.x * dtFactor;
  ball.position.y += ball.velocity.y * dtFactor;

  // Update trail (keep last N positions)
  ball.trail.unshift({ x: ball.position.x, y: ball.position.y });
  if (ball.trail.length > BALL_TRAIL_LENGTH) {
    ball.trail.pop();
  }
}

/**
 * Reflect ball off a paddle with angle based on hit position
 */
export function reflectBallOffPaddle(ball: Ball, paddle: Paddle): void {
  // Calculate hit position on paddle (-1 to 1, center = 0)
  const paddleCenter = paddle.position.y + paddle.height / 2;
  const hitPosition = (ball.position.y - paddleCenter) / (paddle.height / 2);

  // Clamp hit position
  const clampedHit = Math.max(-0.9, Math.min(0.9, hitPosition));

  // Calculate new angle (max 60 degrees from horizontal)
  const maxAngle = Math.PI / 3; // 60 degrees
  const newAngle = clampedHit * maxAngle;

  // Get current speed and apply slight acceleration
  const currentSpeed = Math.sqrt(
    ball.velocity.x ** 2 + ball.velocity.y ** 2
  );
  const newSpeed = Math.min(currentSpeed * BALL_ACCELERATION, BALL_SPEED_MAX);

  // Determine direction (left paddle = positive X, right = negative X)
  const isLeftPaddle = paddle.position.x < 400;
  const direction = isLeftPaddle ? 1 : -1;

  // Set new velocity
  ball.velocity.x = Math.cos(newAngle) * newSpeed * direction;
  ball.velocity.y = Math.sin(newAngle) * newSpeed;

  // Push ball out of paddle to prevent multiple collisions
  if (isLeftPaddle) {
    ball.position.x = paddle.position.x + paddle.width + ball.radius + 1;
  } else {
    ball.position.x = paddle.position.x - ball.radius - 1;
  }
}

/**
 * Reflect ball off top/bottom wall
 */
export function reflectBallOffWall(ball: Ball, isTopWall: boolean): void {
  // Simple Y-axis reflection
  ball.velocity.y = -ball.velocity.y;

  // Ensure ball is within bounds
  if (isTopWall) {
    ball.position.y = ball.radius + 1;
  } else {
    ball.position.y = CANVAS_HEIGHT - ball.radius - 1;
  }
}

/**
 * Update player paddle position based on input
 */
export function updatePlayerPaddle(
  paddle: Paddle,
  input: 'up' | 'down' | null,
  speed: number,
  deltaTime: number
): void {
  if (!input) return;

  const dtFactor = deltaTime / FRAME_TIME;
  const movement = speed * dtFactor;

  if (input === 'up') {
    paddle.position.y = Math.max(0, paddle.position.y - movement);
  } else {
    paddle.position.y = Math.min(
      CANVAS_HEIGHT - paddle.height,
      paddle.position.y + movement
    );
  }
}

/**
 * Create initial ball with random direction
 */
export function createBall(
  x: number,
  y: number,
  speed: number,
  directionX?: number
): Ball {
  // Random angle between -45 and 45 degrees
  const angle = (Math.random() - 0.5) * (Math.PI / 2);
  // Random direction if not specified
  const xDir = directionX ?? (Math.random() > 0.5 ? 1 : -1);

  return {
    position: { x, y },
    velocity: {
      x: Math.cos(angle) * speed * xDir,
      y: Math.sin(angle) * speed,
    },
    radius: 10,
    isGhost: false,
    ghostEndTime: null,
    trail: [],
  };
}

/**
 * Reset ball to center with new random direction
 */
export function resetBall(ball: Ball, speed: number, directionX?: number): void {
  ball.position.x = 400;
  ball.position.y = 300;

  const angle = (Math.random() - 0.5) * (Math.PI / 2);
  const xDir = directionX ?? (Math.random() > 0.5 ? 1 : -1);

  ball.velocity.x = Math.cos(angle) * speed * xDir;
  ball.velocity.y = Math.sin(angle) * speed;
  ball.trail = [];
  ball.isGhost = false;
  ball.ghostEndTime = null;
}
