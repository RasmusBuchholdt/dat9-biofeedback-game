import { Injectable } from '@angular/core';

import {
  CalibrationStrategy,
} from '../_models/calibration/calibration-strategy';
import { DynamicCalibration } from '../_models/calibration/dynamic-calibration';
import {
  HardwareCalibration,
} from '../_models/calibration/hardware-calibration';

@Injectable({
  providedIn: 'root'
})
export class CalibrationService {

  constructor() { }

  public get calibrations(): CalibrationStrategy[] {
    return [
      new DynamicCalibration(),
      new HardwareCalibration()
    ]
  }
}
