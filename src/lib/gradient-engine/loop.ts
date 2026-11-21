import type { RenderTarget } from "./types";

/** Radius of the time circle in noise space at speed 1. */
export const LOOP_RADIUS = 0.6;
/** Frame rate the live loop uses to derive `frameIndex`. */
export const LIVE_FPS = 60;

/** Position along one loop, 0 to 2π. Endpoint input always wraps to zero. */
export function loopPhase(timeSeconds: number, loopSeconds: number): number {
  const wrapped = ((timeSeconds % loopSeconds) + loopSeconds) % loopSeconds;
  return (2 * Math.PI * wrapped) / loopSeconds;
}

/**
 * Noise-space time input. Without an explicit drift, retain the original
 * speed-scaled radius and one lap per loop for saved params. With drift, speed
 * changes pace around the pinned path.
 */
export function loopVector(
  timeSeconds: number,
  loopSeconds: number,
  speed: number,
  drift?: number
): readonly [number, number] {
  const legacy = drift === undefined;
  const phase = loopPhase(timeSeconds, loopSeconds) * (legacy ? 1 : speed);
  const radius = legacy ? speed * LOOP_RADIUS : drift;
  return [Math.cos(phase) * radius, Math.sin(phase) * radius];
}

/** Evaluates the fixed path at an already accumulated runtime phase. */
export function loopVectorAtPhase(
  phase: number,
  drift = LOOP_RADIUS
): readonly [number, number] {
  return [Math.cos(phase) * drift, Math.sin(phase) * drift];
}

/**
 * Grain seed for a frame. It wraps at the live loop length so the grain
 * pattern repeats with the loop too.
 */
export function grainFrame(
  frameIndex: number,
  loopSeconds: number,
  frameRate = LIVE_FPS
): number {
  const period = Math.max(1, Math.round(loopSeconds * frameRate));
  return ((Math.floor(frameIndex) % period) + period) % period;
}

export function fullTarget(width: number, height: number): RenderTarget {
  return { fullHeight: height, fullWidth: width, height, width, x: 0, y: 0 };
}
