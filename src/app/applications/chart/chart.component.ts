import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { CalibrationReadings } from 'src/app/_models/calibration-readings';
import { SeriesEntry } from 'src/app/_models/series-entry';
import { CalibrationService } from 'src/app/_services/calibration.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {
  chartType = "line" as ChartType;
  chartData: ChartDataSets[] = [
    { data: [], label: "Spirometer readings", fill: false }
  ];
  chartLabels: Label[] = [];
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 0
    },
    scales: {
      xAxes: [{
        ticks: {
          maxTicksLimit: this.deviceDetectorService.isDesktop() ? 10 : 5,
          max: this.deviceDetectorService.isDesktop() ? 20 : 10
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

  readings: CalibrationReadings | null = null;
  sensitivity: number;

  calibrations = this.calibrationService.calibrations;

  private subscriptions: Subscription[] = [];

  constructor(
    private spiromagicService: SpiromagicService,
    private deviceDetectorService: DeviceDetectorService,
    private calibrationService: CalibrationService,
  ) { }

  ngOnInit() {
    this.setupSpirometer();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(e => e?.unsubscribe());
  }

  private setupSpirometer(): void {
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading => {
      this.pushReadingToGraph(reading);
    }));
    this.subscriptions.push(this.spiromagicService.sensitivity$.subscribe(sensitivity => {
      this.sensitivity = sensitivity;
    }));
  }

  private pushReadingToGraph(value: number): void {
    if (this.isGraphFull(this.chartData, this.deviceDetectorService.isDesktop() ? 100 : 20)) {
      this.removeLastElement();
    }

    const reading = {
      value: value,
      timestamp: new Date()
    };

    if (!this.readings) {
      this.readings = {
        current: reading.value,
        min: reading.value,
        max: reading.value
      }
    } else if (reading.value < this.readings.min) {
      this.readings.min = reading.value;
    } else if (reading.value > this.readings.max) {
      this.readings.max = reading.value;
    }

    this.readings.current = reading.value;
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
}
