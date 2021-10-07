import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class DynamicCalibration extends CalibrationBase implements CalibrationStrategy {

  get name(): string {
    return 'Dynamic';
  }

  get description(): string {
    return 'The readings will be normalized based on your personal readings.'
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {
    return normalize(reading, minReading, maxReading);
  }
}
