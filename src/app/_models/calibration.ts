export interface Calibration {
  name: string;
  description: string;
  min?: number;
  max?: number;
  calibrationType: CalibrationType;
}

export enum CalibrationType {
  DYNAMIC = 0,
  HARDWARE = 1,
  EXHALE = 2
}
