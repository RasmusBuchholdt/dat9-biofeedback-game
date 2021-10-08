import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class StepperCalibration extends CalibrationBase implements CalibrationStrategy {

  private previousDifference = 0;
  private previousScalar = 0;
  private previousReading: number;
  private currentStepValue = 50;
  private stepSize = 5;

  get name(): string {
    return 'Stepper';
  }

  get description(): string {
    return 'The readings will be normalized in steps based on readings.'
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Prepare variables
    if (!this.previousReading) this.previousReading = reading;
    const difference = Math.abs(this.previousReading - reading);
    if (!this.previousDifference) this.previousDifference = difference;

    // Is the difference big enough?
    const differenceRequired = this.previousReading / (100 * (sensitivity / 100 + 1));
    if (difference >= differenceRequired) {

      // Which direction are we shifting
      const scalar = reading > this.previousReading ? 1 : -1;

      // If we suddenly shift direction with a big jump, we skip this
      if (!(scalar != this.previousScalar && difference > this.previousDifference)) {
        this.currentStepValue += scalar * this.stepSize;
      }

      this.previousScalar = scalar;
    }
    // Update our previous values for next run
    this.previousReading = reading;
    this.previousDifference = difference;

    return normalize(this.currentStepValue, 1, 100);
  }
}
