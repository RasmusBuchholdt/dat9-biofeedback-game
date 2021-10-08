export function scaleNumberToRange(value: number, oldMin: number = 0, oldMax: number = 1, newMin: number, newMax: number) {
  return (((newMax - newMin) * (value - oldMin)) / (oldMax - oldMin)) + newMin;
}
