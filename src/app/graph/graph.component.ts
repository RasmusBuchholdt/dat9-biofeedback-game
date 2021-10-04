import { Component, NgZone, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

import { SeriesEntry } from '../_models/series-entry';
import { SpiroMagicService } from '../_services/spiro-magic.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  batteryLevel: string = '--';
  device: any = {};

  constructor(
    public zone: NgZone,
    public spiroMagicService: SpiroMagicService
  ) { }

  ngOnInit() {
    this.getDeviceStatus();
    this.streamValues();
  }

  streamValues() {
    this.spiroMagicService.stream().subscribe(this.showBatteryLevel.bind(this));
  }

  getDeviceStatus() {
    this.spiroMagicService.getDevice().subscribe(
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
    this.spiroMagicService.getFakeValue();
  }

  getBatteryLevel() {
    return this.spiroMagicService.value().subscribe(this.showBatteryLevel.bind(this));
  }

  counter = 1;
  series: SeriesEntry[] = [];
  showBatteryLevel(value: DataView) {
    // const convertedValue = value.getInt32(1, true);
    const convertedValue = this.normalize(value.getInt32(1, true)).toFixed(2);
    // const convertedValue = this.normalize(value.getInt32(1, true) / 1000000);
    // force change detection
    this.zone.run(() => {
      console.log(this.counter);
      this.series.push({
        id: this.counter,
        value: convertedValue,
        timestamp: new Date()
      });
      this.counter++;
      if (this.counter % 10 === 0)
        this.updateGraph();
      this.batteryLevel = '' + convertedValue;
    });
  }

  download() {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(this.series)], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = 'json.txt';
    a.click();
  }

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
      data: this.series.map(e => e.value)
    });
    this.lineChartLabels = this.series.map(e => `${e.timestamp.getMinutes()}:${e.timestamp.getSeconds()}`);
    this.lineChartData = newDatasets;
  }

  normalize(val: number, min: number = 26804568, max: number = 2107080156) {
    return (val - min) / (max - min) * 100;
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

