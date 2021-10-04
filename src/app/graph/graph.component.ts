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

  private eventsOnChartLimit = 20;
  countEventsChartType = "line" as ChartType;
  countEventsData: ChartDataSets[] = [
    { data: [], label: "Number of Events", fill: false }
  ];
  countEventsLabels: Label[] = [];
  countEventsColors: Color[] = [
    {
      borderColor: "#039BE5",
      pointBackgroundColor: "#039BE5"
    }
  ];
  countEventsOptions: ChartOptions = {
    animation: {
      duration: 0
    }
  };

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  device: BluetoothDevice | null = null;
  lastReading = 0;
  readings = 1;

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
      // this.series.push({
      //   id: this.readings,
      //   value: Math.floor(Math.random() * 100),
      //   timestamp: new Date()
      // });
      this.pushEventToChartData({
        id: this.readings,
        value: Math.floor(Math.random() * 100),
        timestamp: new Date()
      });
      this.fakeValues();
    }, 1000);
  }

  private pushEventToChartData(event: SeriesEntry): void {
    if (this.isChartDataFull(this.countEventsData, 20)) {
      this.removeLastElementFromChartDataAndLabel();
    }
    this.countEventsData[0].data.push(event.value);
    this.countEventsLabels.push(
      this.getLabel(event)
    );
  }
  private getLabel(event: SeriesEntry): string {
    return `${event.id}`;
  }
  private removeLastElementFromChartDataAndLabel(): void {
    this.countEventsData[0].data = this.countEventsData[0].data.slice(1);
    this.countEventsLabels = this.countEventsLabels.slice(1);
  }
  private isChartDataFull(chartData: ChartDataSets[], limit: number): boolean {
    return chartData[0].data.length >= limit;
  }

  streamValues() {
    this.spiroMagicService.stream().subscribe(this.showBatteryLevel.bind(this));
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

  getFakeValue() {
    this.spiroMagicService.getFakeValue();
  }

  getBatteryLevel() {
    return this.spiroMagicService.value().subscribe(this.showBatteryLevel.bind(this));
  }

  series: SeriesEntry[] = [];
  showBatteryLevel(value: number) {
    this.zone.run(() => {
      // Add data to graph
      // this.series.push({
      //   id: this.counter,
      //   value: value,
      //   timestamp: new Date()
      // });
      // this.updateGraph(value);
      this.readings++;
      this.lastReading = value;
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

