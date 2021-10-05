import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { Subscription } from 'rxjs';

import { SeriesEntry } from '../_models/series-entry';
import { SpiromagicService } from '../_services/spiromagic.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, OnDestroy {

  chartType = "line" as ChartType;
  chartData: ChartDataSets[] = [
    { data: [], label: "Spirometer readings", fill: false }
  ];
  chartLabels: Label[] = [];
  chartOptions: ChartOptions = {
    animation: {
      duration: 0
    },
    scales: {
      xAxes: [{
        ticks: {
          // TODO: These needs to be adjusted if mobile
          maxTicksLimit: 10,
          max: 20
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          max: 100,
          min: 0
        }
      }]
    }
  }

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  device: BluetoothDevice | null = null;
  lastReading = 0;
  smallestReading: number;
  biggestReading: number;
  readings = null;

  private subscription: Subscription | null;

  constructor(
    public zone: NgZone,
    public spiromagicService: SpiromagicService
  ) { }

  ngOnInit() {
    // this.fakeValues();
    this.getReadings();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getReadings(): void {
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.pushReadingToGraph(reading);
    });
  }

  private fakeValues(): void {
    setTimeout(() => {
      this.pushReadingToGraph(+Math.random().toFixed(2));
      this.fakeValues();
    }, 100);
  }

  private pushReadingToGraph(value: number): void {
    if (this.isGraphFull(this.chartData, 100)) {
      this.removeLastElement();
    }

    const reading = {
      id: this.readings,
      value: value,
      timestamp: new Date()
    };

    if (!this.biggestReading || reading.value > this.biggestReading)
      this.biggestReading = reading.value;
    if (!this.smallestReading || reading.value < this.smallestReading)
      this.smallestReading = reading.value;

    this.lastReading = reading.value;
    this.readings++;
    this.chartData[0].data.push(reading.value);
    this.chartLabels.push(this.getLabel(reading));
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

  // series: SeriesEntry[] = [];
  // download() {
  //   var a = document.createElement("a");
  //   var file = new Blob([JSON.stringify(this.series)], { type: 'text/plain' });
  //   a.href = URL.createObjectURL(file);
  //   a.download = 'json.txt';
  //   a.click();
  // }
}
