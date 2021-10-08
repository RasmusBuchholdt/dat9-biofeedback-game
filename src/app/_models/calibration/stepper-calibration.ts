import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class StepperCalibration extends CalibrationBase implements CalibrationStrategy {

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

    if (!this.previousReading)
      this.previousReading = reading;

    // If the difference is big enough we need to step
    const difference = Math.abs(this.previousReading - reading);
    if (difference >= this.previousReading / (100 * (sensitivity / 100 + 1))) {
      const scalar = reading > this.previousReading ? 1 : -1;
      this.currentStepValue += scalar * this.stepSize;
    }
    this.previousReading = reading;

    return normalize(this.currentStepValue, 1, 100);
  }
}
