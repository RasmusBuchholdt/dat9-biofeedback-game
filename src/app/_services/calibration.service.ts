import { Injectable } from '@angular/core';

import {
  CalibrationStrategy,
} from '../_models/calibration/calibration-strategy';
import { DynamicCalibration } from '../_models/calibration/dynamic-calibration';
import {
  HardwareCalibration,
} from '../_models/calibration/hardware-calibration';
import { PuffCalibration } from '../_models/calibration/puff-calibration';
import {
  PushEasyCalibration,
} from '../_models/calibration/push-easy-calibration';
import {
  PushHardCalibration,
} from '../_models/calibration/push-hard-calibration';
import { StepperCalibration } from '../_models/calibration/stepper-calibration';

@Injectable({
  providedIn: 'root'
})
export class CalibrationService {

  constructor() { }

  get calibrations(): CalibrationStrategy[] {
    return [
      new DynamicCalibration(),
      new HardwareCalibration(),
      new StepperCalibration(),
      new PushEasyCalibration(),
      new PushHardCalibration(),
      new PuffCalibration()
    ]
  }
}
