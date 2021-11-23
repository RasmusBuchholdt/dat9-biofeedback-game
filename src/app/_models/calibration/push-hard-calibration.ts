import { clamp } from 'src/app/_utils/clamp';
import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class PushHardCalibration extends CalibrationBase implements CalibrationStrategy {

  private previousDifference = 0;
  private previousReading: number;
  private currentStepValue = 50;

  private positiveStepSize = 5;
  private negativeStepSize = 1;

  get name(): string {
    return 'Push (Hard)';
  }

  get description(): string {
    return 'The readings will go up if you continuously blow harder and go down when the readings stop peaking.'
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Prepare variables
    if (!this.previousReading) this.previousReading = reading;
    const difference = Math.abs(this.previousReading - reading);
    if (!this.previousDifference) this.previousDifference = difference;

    // Is the difference big enough?
    const differenceRequired = this.previousReading / (100 * (sensitivity / 100 + 1));

    // Which direction are we shifting
    const scalar = difference >= differenceRequired ? 1 : -1;

    // Get the correct step size
    const stepSize = difference >= differenceRequired ? this.positiveStepSize : this.negativeStepSize;

    // Apply the values to our step value (Including clamping)
    this.currentStepValue = clamp((this.currentStepValue + scalar * stepSize), 1, 100);

    // Update our previous values for next run
    this.previousReading = reading;
    this.previousDifference = difference;

    return normalize(this.currentStepValue, 1, 100);
  }

  reset(): void {
  }
}
