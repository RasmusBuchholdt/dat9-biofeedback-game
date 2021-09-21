import { Component, NgZone, OnInit } from '@angular/core';

import { BatteryLevelService } from '../_services/battery-level.service';

@Component({
  selector: 'app-battery-level',
  templateUrl: './battery-level.component.html',
  styleUrls: ['./battery-level.component.scss']
})
export class BatteryLevelComponent implements OnInit {

  batteryLevel: string = '--';
  device: any = {};

  constructor(
    public _zone: NgZone,
    public _batteryLevelService: BatteryLevelService
  ) { }

  ngOnInit() {
    this.getDeviceStatus();
    this.streamValues();
  }

  streamValues() {
    this._batteryLevelService.stream().subscribe(this.showBatteryLevel.bind(this));
  }

  getDeviceStatus() {
    this._batteryLevelService.getDevice().subscribe(
      (device) => {

        if (device) {
          this.device = device;
        }
        else {
          // device not connected or disconnected
          this.device = null;
          this.batteryLevel = '--';
        }
      }
    );
  }

  getFakeValue() {
    this._batteryLevelService.getFakeValue();
  }

  getBatteryLevel() {
    return this._batteryLevelService.value().subscribe(this.showBatteryLevel.bind(this));
  }

  showBatteryLevel(value: number) {

    // force change detection
    this._zone.run(() => {
      console.log('Reading battery level %d', value);
      this.batteryLevel = '' + value;
    });
  }
}
