import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class PuffCalibration extends CalibrationBase implements CalibrationStrategy {

  private previousReading: number;
  private currentStepValue = 0;
  private defaultStepValue = 0;
  private stepSize = 10;

  get name(): string {
    return 'Puff';
  }

  get description(): string {
    return 'The readings will go up shortly when puffs are detected.'
  }

  get progression(): number {
    return 100;
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Prepare variables
    if (!this.previousReading) this.previousReading = reading;
    const difference = Math.abs(this.previousReading - reading);

    // Is the difference big enough?
    const differenceRequired = this.previousReading / (100 * (sensitivity / 100 + 1));

    // Puff deteceted
    if (difference >= differenceRequired) {
      this.currentStepValue += this.stepSize;
    } else {
      this.currentStepValue = this.defaultStepValue;
    }

    // Update our previous value for next run
    this.previousReading = reading;

    return normalize(this.currentStepValue, 1, 100);
  }

  reset(): void {
  }
}
