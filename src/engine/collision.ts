import type { Ball, Paddle, PowerUp, GameState, CollisionResult } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, POWERUP_RADIUS } from '../constants';

/**
 * Check collision between ball (circle) and paddle (AABB)
 */
function checkBallPaddleCollision(ball: Ball, paddle: Paddle): boolean {
  // Find closest point on paddle to ball center
  const closestX = Math.max(
    paddle.position.x,
    Math.min(ball.position.x, paddle.position.x + paddle.width)
  );
  const closestY = Math.max(
    paddle.position.y,
    Math.min(ball.position.y, paddle.position.y + paddle.height)
  );

  // Calculate distance from closest point to ball center
  const distanceX = ball.position.x - closestX;
  const distanceY = ball.position.y - closestY;
  const distanceSquared = distanceX ** 2 + distanceY ** 2;

  return distanceSquared < ball.radius ** 2;
}

/**
 * Check collision between ball and power-up (circle to circle)
 */
function checkBallPowerUpCollision(ball: Ball, powerUp: PowerUp): boolean {
  const dx = ball.position.x - powerUp.position.x;
  const dy = ball.position.y - powerUp.position.y;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);
  return distance < ball.radius + POWERUP_RADIUS;
}

/**
 * Check all collisions for the current game state
 */
export function checkCollisions(state: GameState): CollisionResult[] {
  const results: CollisionResult[] = [];
  const now = Date.now();

  for (const ball of state.balls) {
    // Check if ghost mode is active
    const isGhostActive = ball.isGhost && ball.ghostEndTime && now < ball.ghostEndTime;

    // Wall collisions (top/bottom) - always check
    if (ball.position.y - ball.radius <= 0) {
      results.push({ type: 'wall_top', ball });
    } else if (ball.position.y + ball.radius >= CANVAS_HEIGHT) {
      results.push({ type: 'wall_bottom', ball });
    }

    // Paddle collisions (skip if ghost)
    if (!isGhostActive) {
      // Player paddle (left side)
      if (
        ball.velocity.x < 0 &&
        checkBallPaddleCollision(ball, state.playerPaddle)
      ) {
        results.push({
          type: 'paddle_player',
          ball,
          target: state.playerPaddle,
        });
      }

      // AI paddle (right side)
      if (
        ball.velocity.x > 0 &&
        checkBallPaddleCollision(ball, state.aiPaddle)
      ) {
        results.push({
          type: 'paddle_ai',
          ball,
          target: state.aiPaddle,
        });
      }
    }

    // Scoring (ball passes paddle area)
    if (ball.position.x - ball.radius <= 0) {
      results.push({ type: 'score_right', ball }); // AI scores
    } else if (ball.position.x + ball.radius >= CANVAS_WIDTH) {
      results.push({ type: 'score_left', ball }); // Player scores
    }

    // Power-up collisions
    for (const powerUp of state.activePowerUps) {
      if (!powerUp.collected && checkBallPowerUpCollision(ball, powerUp)) {
        results.push({ type: 'powerup', ball, target: powerUp });
      }
    }
  }

  return results;
}

/**
 * Check if ball is approaching a specific paddle
 */
export function isBallApproachingPaddle(
  ball: Ball,
  paddle: Paddle,
  isLeftPaddle: boolean
): boolean {
  if (isLeftPaddle) {
    return ball.velocity.x < 0 && ball.position.x > paddle.position.x;
  }
  return ball.velocity.x > 0 && ball.position.x < paddle.position.x;
}
