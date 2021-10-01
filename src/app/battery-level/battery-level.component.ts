import { Component, NgZone, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

import { SeriesEntry } from '../_models/series-entry';
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
  seriesOne: SeriesEntry[] = [];
  seriesTwo: SeriesEntry[] = [];
  seriesThree: SeriesEntry[] = [];

  showBatteryLevel(value: DataView) {
    console.log("tihi", value);


    // console.log(value.getInt16(0));
    // console.log(value.getInt32(0));
    // console.log(value.getFloat32(0));
    // console.log(value.getFloat64(0));
    // console.log(value.getUint16(0));

    const convertedValue = value.getInt32(1, true);
    // force change detection
    this._zone.run(() => {
      console.log(this.counter);
      this.seriesOne.push({
        id: this.counter,
        value: convertedValue,
        timestamp: new Date()
      })
      // this.seriesTwo.push({
      //   id: this.counter,
      //   value: value.getFloat32(0),
      //   timestamp: new Date()
      // })
      // this.seriesThree.push({
      //   id: this.counter,
      //   value: value.get(0),
      //   timestamp: new Date()
      // })
      this.counter++;
      // console.log('Reading battery level %d', value.getInt32(1));
      this.batteryLevel = '' + convertedValue;
    });
  }

  // download() {
  //   var a = document.createElement("a");
  //   var file = new Blob([JSON.stringify(this.series)], { type: 'text/plain' });
  //   a.href = URL.createObjectURL(file);
  //   a.download = 'json.txt';
  //   a.click();
  // }

  updateGraph(): void {
    let newDatasets: ChartDataSets[] = [];
    newDatasets.push({
      label: '1',
      lineTension: 0.3,
      backgroundColor: "#ffb68c",
      borderColor: "#f26d21",
      pointRadius: 3,
      pointBackgroundColor: "#f26d21",
      pointBorderColor: "#f26d21",
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#f26d21",
      pointHoverBorderColor: "#f26d21",
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: this.seriesOne.map(e => e.value)
    });
    newDatasets.push({
      label: '2',
      lineTension: 0.3,
      backgroundColor: "#ffb68c",
      borderColor: "#f26d21",
      pointRadius: 3,
      pointBackgroundColor: "#f26d21",
      pointBorderColor: "#f26d21",
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#f26d21",
      pointHoverBorderColor: "#f26d21",
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: this.seriesTwo.map(e => e.value)
    });
    newDatasets.push({
      label: '3',
      lineTension: 0.3,
      backgroundColor: "#ffb68c",
      borderColor: "#f26d21",
      pointRadius: 3,
      pointBackgroundColor: "#f26d21",
      pointBorderColor: "#f26d21",
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#f26d21",
      pointHoverBorderColor: "#f26d21",
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: this.seriesThree.map(e => e.value)
    });
    this.lineChartLabels = this.seriesOne.map(e => `${e.timestamp.getMinutes()}:${e.timestamp.getSeconds()}`);
    console.log(newDatasets);

    this.lineChartData = newDatasets;
  }

  public lineChartData: ChartDataSets[] = [
    { data: [65], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxTicksLimit: 10
        }
      }],
      yAxes: [{
        ticks: {
          maxTicksLimit: 5,
          padding: 10
        },
        gridLines: {
          color: "rgb(234, 236, 244)",
          zeroLineColor: "rgb(234, 236, 244)",
          drawBorder: false,
          borderDash: [2],
          zeroLineBorderDash: [2]
        }
      }]
    },
    legend: {
      display: true
    },
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      titleMarginBottom: 10,
      titleFontColor: "#6e707e",
      titleFontSize: 14,
      borderColor: "#dddfeb",
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: "index",
      caretPadding: 10,
    }
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line' as ChartType;
  public lineChartPlugins = [];
}

