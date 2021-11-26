import { clamp } from 'src/app/_utils/clamp';
import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class DynamicStepperCalibration extends CalibrationBase implements CalibrationStrategy {

  // Baseline related variables
  private baseline = 0;
  private minBaselineCounter = 50;
  private numberOfIterations = 0;
  private currentMin = 0;
  private currentMax = 0;

  // Calibration related variables
  private previousReading = 0;
  private stepValue = 0;
  private maxValue = 100;
  private minValue = 0;

  private BASELINE_KEY = 'DYNAMIC_STEPPER_BASELINE';
  private MAX_KEY = 'DYNAMIC_STEPPER_MAX';
  private MIN_KEY = 'DYNAMIC_STEPPER_MIN';

  get name(): string {
    return "Dynamic stepper";
  }

  get description(): string {
    return "Stepper which stays at last known location. The amount of force of the breath is taken into consideration.";
  }

  calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {

    // Initialization
    this.setMinMax(minReading, maxReading);
    const currentReading = Math.round(normalize(reading, this.currentMin, this.currentMax));

    // Find baseline
    this.findBaseline(currentReading);

    const stepIncreasePercentage = clamp(sensitivity * 0.01, 0.5, 1);
    const stepIncrement = Math.abs(currentReading - this.baseline) * stepIncreasePercentage;

    // Find step value
    if (currentReading > this.baseline + 1) {
      // I have added 0.5 because it seems that exhale requires more force than inhale.
      this.stepValue += stepIncrement + 0.5;
    }
    //Comment this in if you want to enable inhale.
    /* else if (currentReading < this.baseline - 1) {
      this.stepValue -= stepIncrement;
    } */
    else this.stepValue -= 2;

    // Clamp
    this.stepValue = clamp(this.stepValue, 0, 100);

    // Output
    this.previousReading = currentReading;
    return this.stepValue;
  }

  reset(): void {
    localStorage.removeItem(this.BASELINE_KEY);
    localStorage.removeItem(this.MAX_KEY);
    localStorage.removeItem(this.MIN_KEY);
    this.baseline = 0;
  }

  setMinMax(minReading: number, maxReading: number): void {
    const min = +localStorage.getItem(this.MIN_KEY);
    const max = +localStorage.getItem(this.MAX_KEY);
  
    if(min > minReading) {
      localStorage.setItem(this.MIN_KEY, JSON.stringify(minReading));
      this.currentMin = minReading;
    }
    else this.currentMin = min;

    if(max < maxReading){
      localStorage.setItem(this.MAX_KEY, JSON.stringify(maxReading));
      this.currentMax = maxReading;
    }
    else this.currentMax = max;
  }

  // Find baseline (value when no exhale or inhale has been made)
  // A value is first seen as a baseline after "minBaselineCounter" number of iterations.
  private findBaseline(reading: number): void {
    const content = localStorage.getItem(this.BASELINE_KEY);
    if (content !== null) {
      this.baseline = JSON.parse(content) as number;
    }

    if (reading == this.previousReading) {
      this.numberOfIterations += 1;
      if (this.numberOfIterations > this.minBaselineCounter && reading != this.baseline) {
        this.setBaseline(reading);
      }
    } else {
      this.numberOfIterations = 0;
    }
  }

  private setBaseline(reading: number): void {
    localStorage.setItem(this.BASELINE_KEY, JSON.stringify(reading));
    this.baseline = reading;
  }

}
