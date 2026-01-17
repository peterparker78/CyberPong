import type { GameState, Ball, Paddle, PowerUp } from '../types/game';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  POWERUP_COLORS,
  POWERUP_RADIUS,
} from '../constants';
import { getShakeOffset, renderGlitchEffect } from './effects';
import { renderParticles, renderBallTrail } from './particles';

/**
 * Draw the cyberpunk grid background
 */
function drawBackground(ctx: CanvasRenderingContext2D): void {
  // Fill background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw grid lines
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  const gridSize = 40;

  // Vertical lines
  for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Center line (dashed)
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw a paddle with neon glow effect
 */
function drawPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: Paddle,
  color: string,
  isExtended: boolean
): void {
  ctx.save();

  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = isExtended ? 25 : 15;
  ctx.fillStyle = color;

  // Draw paddle
  ctx.fillRect(
    paddle.position.x,
    paddle.position.y,
    paddle.width,
    paddle.height
  );

  // Inner highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(
    paddle.position.x + 2,
    paddle.position.y + 2,
    paddle.width - 4,
    paddle.height - 4
  );

  ctx.restore();
}

/**
 * Draw the ball with neon glow effect
 */
function drawBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
  ctx.save();

  const color = ball.isGhost ? COLORS.purple : COLORS.cyan;
  const alpha = ball.isGhost ? 0.5 : 1;

  ctx.globalAlpha = alpha;

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright core
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(ball.position.x, ball.position.y, ball.radius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a power-up icon
 */
function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp): void {
  if (powerUp.collected) return;

  ctx.save();

  const color = POWERUP_COLORS[powerUp.type];
  const time = Date.now() / 1000;
  const pulse = Math.sin(time * 4) * 0.2 + 1;
  const radius = POWERUP_RADIUS * pulse;

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(powerUp.position.x, powerUp.position.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner fill
  ctx.fillStyle = `${color}33`; // 20% opacity
  ctx.fill();

  // Icon based on type
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let icon = '';
  switch (powerUp.type) {
    case 'LONG_PADDLE':
      icon = '↕';
      break;
    case 'DOUBLE_BALL':
      icon = '⊕';
      break;
    case 'GHOST_BALL':
      icon = '👻';
      break;
  }

  ctx.fillText(icon, powerUp.position.x, powerUp.position.y);

  ctx.restore();
}

/**
 * Main render function
 */
export function render(
  canvas: HTMLCanvasElement | null,
  state: GameState
): void {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Apply screen shake offset
  const shakeOffset = getShakeOffset(state.screenShake);
  ctx.save();
  ctx.translate(shakeOffset.x, shakeOffset.y);

  // Clear and draw background
  drawBackground(ctx);

  // Draw particles (behind everything)
  renderParticles(ctx, state.particles);

  // Draw ball trails
  for (const ball of state.balls) {
    renderBallTrail(ctx, ball);
  }

  // Draw power-ups
  for (const powerUp of state.activePowerUps) {
    drawPowerUp(ctx, powerUp);
  }

  // Draw paddles
  drawPaddle(
    ctx,
    state.playerPaddle,
    COLORS.cyan,
    state.playerPaddle.isExtended
  );
  drawPaddle(ctx, state.aiPaddle, COLORS.red, false);

  // Draw balls
  for (const ball of state.balls) {
    drawBall(ctx, ball);
  }

  ctx.restore();

  // Apply glitch effect (on top of everything)
  renderGlitchEffect(ctx, canvas, state.glitchEffect);
}

/**
 * Draw idle/paused screen overlay
 */
export function renderOverlay(
  canvas: HTMLCanvasElement | null,
  text: string,
  subtext?: string
): void {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Main text
  ctx.save();
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 20;
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

  // Subtext
  if (subtext) {
    ctx.fillStyle = COLORS.magenta;
    ctx.font = '24px sans-serif';
    ctx.shadowColor = COLORS.magenta;
    ctx.fillText(subtext, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
  }

  ctx.restore();
}
