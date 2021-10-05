import { clamp } from './clamp';

export function normalize(value: number, min: number, max: number): number {
  const clampedValue = clamp(value, min, max);
  return (clampedValue - min) / (max - min) * 100;
}
