import { normalize } from 'src/app/_utils/normalize';

import { CalibrationBase } from './calibration-base';
import { CalibrationStrategy } from './calibration-strategy';

export class DynamicStepperCalibration extends CalibrationBase implements CalibrationStrategy {
    
    // Baseline related variables
    private baseline = 0;
    private minBaselineCounter = 20;
    private numberOfIterations = 0;

    // Calibration related variables
    private previousReading = 0;
    private stepValue = 0;
    private maxValue = 100;
    private minValue = 0;
    private stepIncreasePercentage = 0.1;
    
    get name(): string {
        return "Dynamic stepper";
    }

    get description(): string {
        return "Stepper which stays at last known location. The amount of force of the breath is taken into consideration.";
    }
    
    calibrate(reading: number, minReading: number, maxReading: number, sensitivity: number): number {
        
        // Initialization
        const currentReading = Math.round(normalize(reading, minReading, maxReading))
        
        // Find baseline
        this.findBaseline(currentReading)
        
        const stepIncrement = Math.abs(currentReading - this.baseline) * this.stepIncreasePercentage;

        // Find step value
        if(currentReading > this.baseline + 1 && this.stepValue < this.maxValue)
            this.stepValue += stepIncrement;
        else if(currentReading < this.baseline - 1 && this.stepValue > this.minValue)
            this.stepValue -= stepIncrement;

        if(this.stepValue > this.maxValue) this.stepValue = this.maxValue;
        else if(this.stepValue < this.minValue) this.stepValue = this.minValue;

        // Output
        this.previousReading = currentReading;
        return this.stepValue;
    }

    // Find baseline (value when no exhale or inhale has been made)
    // A value is first seen as a baseline after "minBaselineCounter" number of iterations.
    findBaseline(reading: number): void {
        
        if(reading == this.previousReading)
        {
            this.numberOfIterations += 1;
            if(this.numberOfIterations > this.minBaselineCounter) this.baseline = reading;
        }
        else this.numberOfIterations = 0;
    }
    
}