import type { GameState, ScreenShake, GlitchEffect } from '../types/game';
import { SCREEN_SHAKE_INTENSITY, SCREEN_SHAKE_DURATION, GLITCH_DURATION } from '../constants';

/**
 * Trigger screen shake effect
 */
export function triggerScreenShake(state: GameState, intensity: number = SCREEN_SHAKE_INTENSITY): void {
  state.screenShake = {
    active: true,
    intensity,
    duration: SCREEN_SHAKE_DURATION,
    startTime: Date.now(),
  };
}

/**
 * Update screen shake state
 */
export function updateScreenShake(shake: ScreenShake): void {
  if (!shake.active) return;

  const elapsed = Date.now() - shake.startTime;
  if (elapsed >= shake.duration) {
    shake.active = false;
  }
}

/**
 * Get current shake offset
 */
export function getShakeOffset(shake: ScreenShake): { x: number; y: number } {
  if (!shake.active) return { x: 0, y: 0 };

  const elapsed = Date.now() - shake.startTime;
  const progress = elapsed / shake.duration;
  const decayingIntensity = shake.intensity * (1 - progress);

  return {
    x: (Math.random() - 0.5) * decayingIntensity * 2,
    y: (Math.random() - 0.5) * decayingIntensity * 2,
  };
}

/**
 * Trigger glitch effect on score
 */
export function triggerGlitchEffect(state: GameState): void {
  state.glitchEffect = {
    active: true,
    duration: GLITCH_DURATION,
    startTime: Date.now(),
  };
}

/**
 * Update glitch effect state
 */
export function updateGlitchEffect(glitch: GlitchEffect): void {
  if (!glitch.active) return;

  const elapsed = Date.now() - glitch.startTime;
  if (elapsed >= glitch.duration) {
    glitch.active = false;
  }
}

/**
 * Render glitch effect overlay
 */
export function renderGlitchEffect(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  glitch: GlitchEffect
): void {
  if (!glitch.active) return;

  const elapsed = Date.now() - glitch.startTime;
  if (elapsed >= glitch.duration) return;

  const intensity = 1 - elapsed / glitch.duration;
  const sliceCount = Math.floor(5 + Math.random() * 10 * intensity);

  // Save context state
  ctx.save();

  // Create glitch slices
  for (let i = 0; i < sliceCount; i++) {
    const y = Math.floor(Math.random() * canvas.height);
    const height = Math.floor(5 + Math.random() * 20);
    const offset = Math.floor((Math.random() - 0.5) * 30 * intensity);

    // Get slice and redraw with offset
    try {
      const slice = ctx.getImageData(0, y, canvas.width, Math.min(height, canvas.height - y));
      ctx.putImageData(slice, offset, y);
    } catch {
      // Ignore errors from getImageData
    }
  }

  // Add color channel separation
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = `rgba(255, 0, 0, ${0.1 * intensity})`;
  ctx.fillRect(2, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgba(0, 255, 255, ${0.1 * intensity})`;
  ctx.fillRect(-2, 0, canvas.width, canvas.height);

  // Restore context state
  ctx.restore();
}
