export interface CalibrationOption {
  name: string;
  description: string;
  calibration: Calibration;
}

export enum Calibration {
  DYNAMIC = 0,
  HARDWARE = 1,
  EXHALE = 2
}
