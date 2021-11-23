import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class ConstantStepperCalibration extends CalibrationBase implements CalibrationStrategy {

  // Baseline related variables
  private baseline = 0;
  private minBaselineCounter = 20;
  private numberOfIterations = 0;

  // Calibration related variables
  private previousReading = 0;
  private stepValue = 0;
  private stepIncrement = 3;
  private maxValue = 100;
  private minValue = 0;

  private BASELINE_KEY = 'CONSTANT_STEPPER_BASELINE';

  get name(): string {
    return "Constant stepper";
  }

  get description(): string {
    return "Stepper which stays at last known location.";
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Initialization
    const currentReading = Math.round(normalize(reading, minReading, maxReading));

    // Find baseline
    this.findBaseline(currentReading);

    // Find step value
    if (currentReading > this.baseline + 1 && this.stepValue < this.maxValue)
      this.stepValue += this.stepIncrement;
    else if (currentReading < this.baseline - 1 && this.stepValue > this.minValue)
      this.stepValue -= this.stepIncrement;

    // Output
    this.previousReading = currentReading;
    return this.stepValue;
  }

  reset(): void {
    localStorage.removeItem(this.BASELINE_KEY);
    this.baseline = 0;
    console.log("reset");

  }

  // Find baseline (value when no exhale or inhale has been made)
  // A value is first seen as a baseline after "minBaselineCounter" number of iterations.
  private findBaseline(reading: number): void {
    const content = localStorage.getItem(this.BASELINE_KEY);
    if (content !== null) {
      this.baseline = JSON.parse(content) as number;
      return;
    }

    if (reading == this.previousReading) {
      this.numberOfIterations += 1;
      if (this.numberOfIterations > this.minBaselineCounter)
        this.setBaseline(reading);
    } else {
      this.numberOfIterations = 0;
    }
  }

  private setBaseline(reading: number): void {
    localStorage.setItem(this.BASELINE_KEY, JSON.stringify(reading));
    this.baseline = reading;
  }
}
