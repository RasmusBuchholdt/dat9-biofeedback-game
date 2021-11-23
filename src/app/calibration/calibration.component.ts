import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { CalibrationReadings } from '../_models/calibration-readings';
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

  readings: CalibrationReadings | null = null;
  sensitivity: number;

  calibrations = this.calibrationService.calibrations;
  activeCalibration: CalibrationStrategy | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private toastrService: ToastrService,
    private spiromagicService: SpiromagicService,
    private deviceDetectorService: DeviceDetectorService,
    private calibrationService: CalibrationService
  ) { }

  ngOnInit() {
    // this.fakeReadings();
    this.setupSpirometer();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(e => e?.unsubscribe());
  }

  changeCalibration(calibration: CalibrationStrategy): void {
    this.spiromagicService.calibration$.next(calibration);
    this.resetReadings(false);
    this.toastrService.success(`Calibration has been changed to <b>${calibration.name}</b>`, 'Calibration changed');
  }

  changeSensitivity(value: number): void {
    this.spiromagicService.sensitivity$.next(value);
  }

  resetReadings(showMessage: boolean = true): void {
    this.readings = null;
    this.spiromagicService.resetReadings();
    if (showMessage)
      this.toastrService.success('The readings have been reset!', 'Readings reset');
  }

  resetCalibration(): void {
    this.spiromagicService.calibration$.getValue().reset();
  }

  private setupSpirometer(): void {
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading => {
      this.pushReadingToGraph(reading);
    }));
    this.subscriptions.push(this.spiromagicService.calibration$.subscribe(calibration => {
      this.activeCalibration = calibration;
    }));
    this.subscriptions.push(this.spiromagicService.sensitivity$.subscribe(sensitivity => {
      this.sensitivity = sensitivity;
    }));
  }

  private fakeReadings(): void {
    setTimeout(() => {
      this.pushReadingToGraph(+Math.random().toFixed(2));
      this.fakeReadings();
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
