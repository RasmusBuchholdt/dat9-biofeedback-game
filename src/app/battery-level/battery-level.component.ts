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
        console.log("device", device);

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

  counter = 1;
  series: SeriesEntry[] = [];

  showBatteryLevel(value: DataView) {
    // force change detection
    this._zone.run(() => {
      console.log(this.counter);
      this.series.push({
        id: this.counter,
        value: value.getInt16(0),
        timestamp: new Date()
      })
      this.counter++;
      // console.log('Reading battery level %d', value.getInt32(1));
      this.batteryLevel = '' + value.getInt32(1);
    });
  }

  download() {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(this.series)], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = 'json.txt';
    a.click();
  }
}

export interface SeriesEntry {
  id: number;
  value: any
  timestamp: Date;
}
