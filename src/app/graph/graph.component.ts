import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';

import { SeriesEntry } from '../_models/series-entry';
import { SpiroMagicService } from '../_services/spiro-magic.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  chartType = "line" as ChartType;
  chartData: ChartDataSets[] = [
    { data: [], label: "Spirometer readings", fill: false }
  ];
  chartLabels: Label[] = [];
  chartColors: Color[] = [
    {
      borderColor: "#039BE5",
      pointBackgroundColor: "#039BE5"
    }
  ];
  chartOptions: ChartOptions = {
    animation: {
      duration: 0
    },
    scales: {
      xAxes: [{
        ticks: {
          maxTicksLimit: 30
        }
      }],
    }
  }

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  device: BluetoothDevice | null = null;
  lastReading = 0;
  readings = null;

  constructor(
    public zone: NgZone,
    public spiroMagicService: SpiroMagicService
  ) { }

  ngOnInit() {
    this.getDeviceStatus();
    this.streamValues();
    this.fakeValues();
  }

  fakeValues(): void {
    setTimeout(() => {
      this.pushReadingToGraph({
        id: this.readings,
        value: Math.floor(Math.random() * 100),
        timestamp: new Date()
      });
      this.fakeValues();
    }, 100);
  }

  private pushReadingToGraph(entry: SeriesEntry): void {
    if (this.isGraphFull(this.chartData, 20)) {
      this.removeLastElement();
    }
    this.lastReading = entry.value;
    this.readings++;
    this.chartData[0].data.push(entry.value);
    this.chartLabels.push(
      this.getLabel(entry)
    );
  }

  private getLabel(event: SeriesEntry): string {
    return `${event.timestamp.getHours()}:${event.timestamp.getMinutes()}:${event.timestamp.getSeconds()}`
  }

  private removeLastElement(): void {
    this.chartData[0].data = this.chartData[0].data.slice(1);
    this.chartLabels = this.chartLabels.slice(1);
  }

  private isGraphFull(chartData: ChartDataSets[], limit: number): boolean {
    return chartData[0].data.length >= limit;
  }

  streamValues() {
    this.spiroMagicService.stream().subscribe(this.showSpirometerReading.bind(this));
  }

  getDeviceStatus() {
    this.spiroMagicService.getDevice().subscribe(
      (device) => {
        if (device) {
          this.device = device;
        } else {
          // device not connected or disconnected
          this.device = null;
          this.lastReading = 0;
        }
      }
    );
  }

  getSpirometerReadings() {
    return this.spiroMagicService.value().subscribe(this.showSpirometerReading.bind(this));
  }

  showSpirometerReading(value: number) {
    this.zone.run(() => {
      // Add data to graph
      this.pushReadingToGraph({
        id: this.readings,
        value: value,
        timestamp: new Date()
      });
    });
  }

  // series: SeriesEntry[] = [];
  // download() {
  //   var a = document.createElement("a");
  //   var file = new Blob([JSON.stringify(this.series)], { type: 'text/plain' });
  //   a.href = URL.createObjectURL(file);
  //   a.download = 'json.txt';
  //   a.click();
  // }
}
