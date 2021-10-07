import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { Calibration, CalibrationType } from '../_models/calibration';
import { normalize } from '../_utils/normalize';
import { GATTCharacteristicService } from './gatt-characteristic.service';

@Injectable({
  providedIn: 'root'
})
export class SpiromagicService implements OnDestroy {

  public connected = false;
  public reading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  public calibration$: BehaviorSubject<Calibration | null> = new BehaviorSubject<Calibration | null>(this.calibrations[0]);
  public minReading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(Number.MAX_SAFE_INTEGER);
  public maxReading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(Number.MIN_SAFE_INTEGER);
  public sensitivity$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(1);
  private subscription: Subscription | null = null;

  constructor(
    private zone: NgZone,
    public gattService: GATTCharacteristicService
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

  private convertValue(value: DataView): number {
    const rawValue = value.getInt32(1, true);
    const calibration = this.calibration$.getValue();
    const sensitivity = this.sensitivity$.getValue();

    if (rawValue > this.maxRawReading) {
      this.maxRawReading = rawValue;
      console.log("New raw max reading", this.maxRawReading);
    }
    if (rawValue < this.minRawReading) {
      this.minRawReading = rawValue;
      console.log("New raw min reading", this.minRawReading);
    }

    // TODO: Find out how exactly to apply sensitivity

    const min = (calibration.min || this.minRawReading);
    const max = (calibration.max || this.maxRawReading);

    return +normalize(rawValue, min, max).toFixed(2);
  }

  get device(): Observable<BluetoothDevice> {
    return this.gattService.getDevice();
  }

  get calibrations(): Calibration[] {
    return [
      {
        name: 'Dynamic',
        description: 'The readings will be normalized based on your personal readings.',
        calibrationType: CalibrationType.DYNAMIC
      },
      {
        name: 'Hardware',
        description: 'The readings will be normalized based on the hardware capacity.',
        calibrationType: CalibrationType.HARDWARE,
        min: 26804568,
        max: 2110814406
      },
      {
        name: 'Exhale',
        description: 'The readings will be normalized based on the overall average exhale readings.',
        calibrationType: CalibrationType.EXHALE,
        min: 436542358,
        max: 469441172
      }
    ];
  }
}
