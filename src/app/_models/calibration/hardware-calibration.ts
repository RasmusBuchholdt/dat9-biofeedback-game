import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class HardwareCalibration extends CalibrationBase implements CalibrationStrategy {

  private min = 26804568;
  private max = 2110814406;

  get name(): string {
    return "Hardware";
  }

  get description(): string {
    return 'The readings will be normalized based on the hardware capacity.';
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {
    return normalize(reading * (sensitivity / 100 + 1), this.min, this.max);
  }
}
