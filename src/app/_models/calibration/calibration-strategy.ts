export interface CalibrationStrategy {
  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number;
  get name(): string;
  get description(): string;
}
