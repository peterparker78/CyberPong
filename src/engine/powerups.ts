import type { Ball, PowerUp, PowerUpType, GameState, Particle } from '../types/game';
import {
  POWERUP_SPAWN_INTERVAL_MIN,
  POWERUP_SPAWN_INTERVAL_MAX,
  POWERUP_SPAWN_AREA,
  POWERUP_DURATION,
  GHOST_BALL_DURATION,
  PADDLE_EXTENDED_MULTIPLIER,
  POWERUP_COLORS,
  PARTICLE_MAX_LIFE,
} from '../constants';

const POWERUP_TYPES: PowerUpType[] = ['LONG_PADDLE', 'DOUBLE_BALL', 'GHOST_BALL'];

/**
 * Generate a random spawn interval for the next power-up
 */
function getNextSpawnTime(): number {
  return (
    Date.now() +
    POWERUP_SPAWN_INTERVAL_MIN +
    Math.random() * (POWERUP_SPAWN_INTERVAL_MAX - POWERUP_SPAWN_INTERVAL_MIN)
  );
}

/**
 * Spawn a new power-up in the center area
 */
export function spawnPowerUp(state: GameState): void {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

  const powerUp: PowerUp = {
    id: `powerup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    position: {
      x: POWERUP_SPAWN_AREA.xMin + Math.random() * (POWERUP_SPAWN_AREA.xMax - POWERUP_SPAWN_AREA.xMin),
      y: POWERUP_SPAWN_AREA.yMin + Math.random() * (POWERUP_SPAWN_AREA.yMax - POWERUP_SPAWN_AREA.yMin),
    },
    spawnTime: Date.now(),
    collected: false,
  };

  state.activePowerUps.push(powerUp);
  state.nextPowerUpSpawn = getNextSpawnTime();
}

/**
 * Create particles for power-up collection effect
 */
function createCollectionParticles(position: { x: number; y: number }, color: string): Particle[] {
  const particles: Particle[] = [];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 3 + Math.random() * 3;

    particles.push({
      id: `particle-${Date.now()}-${i}`,
      position: { x: position.x, y: position.y },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      color,
      size: 6 + Math.random() * 4,
      life: 1,
      maxLife: PARTICLE_MAX_LIFE,
    });
  }

  return particles;
}

/**
 * Apply power-up effect when collected
 */
export function applyPowerUp(
  state: GameState,
  powerUp: PowerUp,
  collectingBall: Ball
): void {
  powerUp.collected = true;
  const now = Date.now();
  const color = POWERUP_COLORS[powerUp.type];

  switch (powerUp.type) {
    case 'LONG_PADDLE':
      // Only apply to player paddle
      if (!state.playerPaddle.isExtended) {
        state.playerPaddle.height = state.playerPaddle.baseHeight * PADDLE_EXTENDED_MULTIPLIER;
        state.playerPaddle.isExtended = true;
        state.playerPaddle.extendedEndTime = now + POWERUP_DURATION;
      } else {
        // Extend duration if already active
        state.playerPaddle.extendedEndTime = now + POWERUP_DURATION;
      }
      break;

    case 'DOUBLE_BALL':
      // Spawn a second ball traveling in opposite Y direction
      const newBall: Ball = {
        position: { x: collectingBall.position.x, y: collectingBall.position.y },
        velocity: {
          x: collectingBall.velocity.x,
          y: -collectingBall.velocity.y,
        },
        radius: collectingBall.radius,
        isGhost: false,
        ghostEndTime: null,
        trail: [],
      };
      state.balls.push(newBall);
      break;

    case 'GHOST_BALL':
      // Make the collecting ball ghost
      collectingBall.isGhost = true;
      collectingBall.ghostEndTime = now + GHOST_BALL_DURATION;
      break;
  }

  // Add collection particles
  const particles = createCollectionParticles(powerUp.position, color);
  state.particles.push(...particles);
}

/**
 * Update power-up timers and effects
 */
export function updatePowerUps(state: GameState): void {
  const now = Date.now();

  // Check if it's time to spawn a new power-up
  if (now >= state.nextPowerUpSpawn && state.activePowerUps.filter(p => !p.collected).length < 2) {
    spawnPowerUp(state);
  }

  // Update Long Paddle effect
  if (
    state.playerPaddle.isExtended &&
    state.playerPaddle.extendedEndTime &&
    now >= state.playerPaddle.extendedEndTime
  ) {
    state.playerPaddle.height = state.playerPaddle.baseHeight;
    state.playerPaddle.isExtended = false;
    state.playerPaddle.extendedEndTime = null;
  }

  // Update Ghost Ball effects
  for (const ball of state.balls) {
    if (ball.isGhost && ball.ghostEndTime && now >= ball.ghostEndTime) {
      ball.isGhost = false;
      ball.ghostEndTime = null;
    }
  }

  // Clean up collected power-ups (with a small delay for visual effect)
  state.activePowerUps = state.activePowerUps.filter(
    (p) => !p.collected || now - p.spawnTime < 500
  );
}

/**
 * Initialize power-up spawn timer
 */
export function initPowerUpTimer(): number {
  return getNextSpawnTime();
}
