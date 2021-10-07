import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import {
  CalibrationStrategy,
} from '../_models/calibration/calibration-strategy';
import { CalibrationService } from './calibration.service';
import { GATTCharacteristicService } from './gatt-characteristic.service';

@Injectable({
  providedIn: 'root'
})
export class SpiromagicService implements OnDestroy {

  public connected = false;
  public reading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  public calibration$: BehaviorSubject<CalibrationStrategy | null> = new BehaviorSubject<CalibrationStrategy | null>(this.calibrationService.calibrations[0]);
  public minReading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(Number.MAX_SAFE_INTEGER);
  public maxReading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(Number.MIN_SAFE_INTEGER);
  public sensitivity$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(0);
  private subscription: Subscription | null = null;

  constructor(
    private zone: NgZone,
    private gattService: GATTCharacteristicService,
    private calibrationService: CalibrationService
  ) {
    this.subscription = this.gattService
      .stream(
        '73ab1200-a251-4c85-0f8c-d8db000021df',
        '73ab1201-a251-4c85-0f8c-d8db000021df',
        [
          { name: 'SPIRO/MAGIC' },
          { services: ['73ab1200-a251-4c85-0f8c-d8db000021df'] }
        ])
      .subscribe(reading => {
        this.handleReading(reading);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public connect(): void {
    this.getSpirometerReadings();
  }

  public disconnect(): void {
    this.connected = false;
    this.gattService.disconnectDevice();
  }

  private getSpirometerReadings() {
    this.connected = true;
    return this.gattService.value().subscribe(this.handleReading.bind(this));
  }

  private handleReading(value: DataView) {
    this.zone.run(() => {
      this.reading$.next(this.convertValue(value));
    });
  }

  private minRawReading = Number.MAX_SAFE_INTEGER;
  private maxRawReading = Number.MIN_SAFE_INTEGER;

  private convertValue(reading: DataView): number {
    const rawReading = reading.getInt32(1, true);
    const calibration = this.calibration$.getValue();
    const sensitivity = this.sensitivity$.getValue();

    if (rawReading > this.maxRawReading) {
      this.maxRawReading = rawReading;
      console.log("New raw max reading", this.maxRawReading);
    }
    if (rawReading < this.minRawReading) {
      this.minRawReading = rawReading;
      console.log("New raw min reading", this.minRawReading);
    }

    return +calibration.calibrate(rawReading, this.minRawReading, this.maxRawReading, sensitivity).toFixed(2);
  }

  get device(): Observable<BluetoothDevice> {
    return this.gattService.getDevice();
  }
}
