import { clamp } from 'src/app/_utils/clamp';
import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class PushEasyCalibration extends CalibrationBase implements CalibrationStrategy {

  private initialBreathReading: number;
  private previousDifference = 0;
  private previousReading: number;
  private currentStepValue = 50;

  private positiveStepSize = 5;
  private negativeStepSize = 1;

  get name(): string {
    return 'Push (Easy)';
  }

  get description(): string {
    return 'The readings will go up if you continuously go up if any breathing is detected.'
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Prepare variables
    if (!this.previousReading) this.previousReading = reading;
    const difference = Math.abs(this.previousReading - reading);
    if (!this.previousDifference) this.previousDifference = difference;

    // Did we detect breathing?
    // TODO: This needs to be better and include sensitivity somehow.
    if (reading >= minReading * 1.2) {
      // Set the initial value for this "breathing" session
      this.initialBreathReading = reading;
    }

    // We don't want to move before first breath is detected
    if (this.initialBreathReading) {

      // Which direction are we shifting
      const scalar = reading >= this.initialBreathReading ? 1 : -1;

      // Get the correct step size
      const stepSize = scalar === 1 ? this.positiveStepSize : this.negativeStepSize;

      // Apply the values to our step value if we have an initial value (Including clamping)
      this.currentStepValue = clamp((this.currentStepValue + scalar * stepSize), 1, 100);

      // If we are shifting down, then the latest reading will be our current minima
      if (scalar === -1) {
        this.initialBreathReading = reading;
      }
    }

    // Update our previous values for next run
    this.previousReading = reading;
    this.previousDifference = difference;

    return normalize(this.currentStepValue, 1, 100);
  }
}
