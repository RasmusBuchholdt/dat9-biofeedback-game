import { clamp } from 'src/app/_utils/clamp';
import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class PushEasyCalibration extends CalibrationBase implements CalibrationStrategy {

  private initialDifference: number;
  private previousDifference = 0;
  private previousReading: number;
  private currentStepValue = 50;

  private positiveStepSize = 5;
  private negativeStepSize = 5;

  get name(): string {
    return 'Push (Easy)';
  }

  get description(): string {
    return 'The readings will go continuously up if any breathing is detected.'
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Prepare variables
    if (!this.previousReading) this.previousReading = reading;
    const difference = Math.abs(this.previousReading - reading);
    if (!this.previousDifference) this.previousDifference = difference;

    // Did we detect breathing?
    const differenceRequired = this.previousReading * 1.1 / (100 * (sensitivity / 100 + 1));

    if (difference >= differenceRequired) {
      // Set the initial value for this "breathing" session
      this.initialDifference = difference;
      console.log("Initial difference", difference);
    }

    // We don't want to move before first breath is detected
    if (this.initialDifference) {
      // Which direction are we shifting
      const scalar = difference >= this.initialDifference ? 1 : -1;
      console.log("Current scalar", scalar);

      // Get the correct step size
      const stepSize = scalar === 1 ? this.positiveStepSize : this.negativeStepSize;

      // Apply the values to our step value if we have an initial value (Including clamping)
      this.currentStepValue = clamp((this.currentStepValue + scalar * stepSize), 1, 100);

      // If we are shifting down, then the latest reading will be our current minima
      if (scalar === -1) {
        // this.initialDifference = null;
        console.log("Shifting down");
      }
    }

    // Update our previous values for next run
    this.previousReading = reading;
    this.previousDifference = difference;

    return normalize(this.currentStepValue, 1, 100);
  }

  reset(): void {
  }
}
