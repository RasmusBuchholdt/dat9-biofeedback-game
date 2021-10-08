import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';

import {
  CalibrationStrategy,
} from '../_models/calibration/calibration-strategy';
import { SeriesEntry } from '../_models/series-entry';
import { CalibrationService } from '../_services/calibration.service';
import { SpiromagicService } from '../_services/spiromagic.service';

@Component({
  selector: 'app-calibration',
  templateUrl: './calibration.component.html',
  styleUrls: ['./calibration.component.scss']
})
export class CalibrationComponent implements OnInit, OnDestroy {
  chartType = "line" as ChartType;
  chartData: ChartDataSets[] = [
    { data: [], label: "Spirometer readings", fill: false }
  ];
  chartLabels: Label[] = [];
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  device: BluetoothDevice | null = null;
  lastReading: number;
  minReading: number;
  maxReading: number;
  sensitivity: number;

  calibrations = this.calibrationService.calibrations;
  activeCalibration: CalibrationStrategy | null = null;
  calibrationDescription: string;

  private subscriptions: Subscription[] = [];

  constructor(
    private zone: NgZone,
    private spiromagicService: SpiromagicService,
    private deviceDetectorService: DeviceDetectorService,
    private calibrationService: CalibrationService
  ) { }

  ngOnInit() {
    // this.fakeValues();
    this.setupSpirometer();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(e => e?.unsubscribe());
  }

  changeCalibration(calibration: CalibrationStrategy): void {
    this.spiromagicService.calibration$.next(calibration);
  }

  changeSensitivity(value: number): void {
    this.spiromagicService.sensitivity$.next(value);
  }

  resetReadings(): void {
    this.spiromagicService.resetReadings();
  }

  private setupSpirometer(): void {
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading => {
      this.pushReadingToGraph(reading);
    }));
    this.subscriptions.push(this.spiromagicService.calibration$.subscribe(calibration => {
      this.activeCalibration = calibration;
    }));
    this.subscriptions.push(this.spiromagicService.minReading$.subscribe(minReading => {
      this.minReading = minReading;
    }));
    this.subscriptions.push(this.spiromagicService.maxReading$.subscribe(maxReading => {
      this.maxReading = maxReading;
    }));
    this.subscriptions.push(this.spiromagicService.sensitivity$.subscribe(sensitivity => {
      this.sensitivity = sensitivity;
    }));
  }

  private fakeValues(): void {
    setTimeout(() => {
      this.pushReadingToGraph(+Math.random().toFixed(2));
      this.fakeValues();
    }, 100);
  }

  private pushReadingToGraph(value: number): void {
    if (this.isGraphFull(this.chartData, this.deviceDetectorService.isDesktop() ? 100 : 20)) {
      this.removeLastElement();
    }

    const reading = {
      value: value,
      timestamp: new Date()
    };

    if (!this.minReading || reading.value < this.minReading)
      this.spiromagicService.minReading$.next(reading.value);
    if (!this.maxReading || reading.value > this.maxReading)
      this.spiromagicService.maxReading$.next(reading.value);

    this.lastReading = reading.value;
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
