import type { Particle, Ball } from '../types/game';
import { FRAME_TIME, PARTICLE_MAX_LIFE, PARTICLE_BASE_SIZE, COLORS } from '../constants';

/**
 * Create a trail particle from ball position
 */
export function createTrailParticle(ball: Ball): Particle {
  const color = ball.isGhost ? COLORS.purple : COLORS.cyan;

  return {
    id: `trail-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    position: { x: ball.position.x, y: ball.position.y },
    velocity: {
      x: (Math.random() - 0.5) * 1,
      y: (Math.random() - 0.5) * 1,
    },
    color,
    size: PARTICLE_BASE_SIZE + Math.random() * 3,
    life: 1,
    maxLife: PARTICLE_MAX_LIFE * 0.5, // Trail particles are shorter-lived
  };
}

/**
 * Create burst particles for wall bounce
 */
export function createBounceParticles(
  x: number,
  y: number,
  isVertical: boolean
): Particle[] {
  const particles: Particle[] = [];
  const count = 8;

  for (let i = 0; i < count; i++) {
    // Spread particles in the direction of the bounce
    const baseAngle = isVertical ? Math.PI / 2 : 0;
    const spread = Math.PI / 3;
    const angle = baseAngle + (Math.random() - 0.5) * spread;
    const speed = 2 + Math.random() * 3;

    particles.push({
      id: `bounce-${Date.now()}-${i}`,
      position: { x, y },
      velocity: {
        x: Math.cos(angle) * speed * (isVertical ? (Math.random() > 0.5 ? 1 : -1) : 1),
        y: Math.sin(angle) * speed * (isVertical ? 1 : (Math.random() > 0.5 ? 1 : -1)),
      },
      color: COLORS.cyan,
      size: PARTICLE_BASE_SIZE + Math.random() * 4,
      life: 1,
      maxLife: PARTICLE_MAX_LIFE,
    });
  }

  return particles;
}

/**
 * Create paddle hit particles
 */
export function createPaddleHitParticles(
  x: number,
  y: number,
  isLeftPaddle: boolean
): Particle[] {
  const particles: Particle[] = [];
  const count = 10;
  const color = isLeftPaddle ? COLORS.cyan : COLORS.red;
  const direction = isLeftPaddle ? 1 : -1;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    const speed = 3 + Math.random() * 4;

    particles.push({
      id: `hit-${Date.now()}-${i}`,
      position: { x, y },
      velocity: {
        x: Math.cos(angle) * speed * direction,
        y: Math.sin(angle) * speed,
      },
      color,
      size: PARTICLE_BASE_SIZE + Math.random() * 3,
      life: 1,
      maxLife: PARTICLE_MAX_LIFE,
    });
  }

  return particles;
}

/**
 * Update all particles
 */
export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  const dtSeconds = deltaTime / 1000;

  return particles
    .map((p) => ({
      ...p,
      position: {
        x: p.position.x + p.velocity.x * (deltaTime / FRAME_TIME),
        y: p.position.y + p.velocity.y * (deltaTime / FRAME_TIME),
      },
      velocity: {
        x: p.velocity.x * 0.98, // Slight drag
        y: p.velocity.y * 0.98,
      },
      life: p.life - dtSeconds / p.maxLife,
    }))
    .filter((p) => p.life > 0);
}

/**
 * Render all particles
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void {
  for (const p of particles) {
    const alpha = Math.max(0, p.life);
    const size = p.size * p.life;

    // Glow effect
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.position.x, p.position.y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Core particle
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.position.x, p.position.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Render ball trail
 */
export function renderBallTrail(
  ctx: CanvasRenderingContext2D,
  ball: Ball
): void {
  if (ball.trail.length < 2) return;

  const color = ball.isGhost ? COLORS.purple : COLORS.cyan;

  for (let i = 1; i < ball.trail.length; i++) {
    const pos = ball.trail[i];
    const alpha = (1 - i / ball.trail.length) * 0.5;
    const size = ball.radius * (1 - i / ball.trail.length) * 0.8;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
