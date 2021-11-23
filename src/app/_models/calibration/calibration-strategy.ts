export interface CalibrationStrategy {
  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number;
  reset(): void;
  get name(): string;
  get description(): string;
}
