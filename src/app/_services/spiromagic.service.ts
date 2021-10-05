import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

import { NormalizationStrategy } from '../_models/normalization-strategy';
import { normalize } from '../_utils/normalize';
import { GATTCharacteristicService } from './gatt-characteristic.service';

@Injectable({
  providedIn: 'root'
})
export class SpiromagicService implements OnDestroy {

  public connected = false;
  public reading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  private subscription: Subscription | null = null;
  private selectedNormalizationStrategy = NormalizationStrategy.EXHALE;

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

  public setNormalizationStrategy(strategy: NormalizationStrategy): void {
    this.selectedNormalizationStrategy = strategy;
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

  private maxReading = 0;
  private minReading = Number.MAX_SAFE_INTEGER;

  private convertValue(value: DataView): number {
    const rawValue = value.getInt32(1, true);

    // TODO: Refactor this
    let min: number;
    let max: number;

    if (this.selectedNormalizationStrategy === NormalizationStrategy.HARDWARE) {
      min = 26804568;
      max = 2110814406;
    } else if (this.selectedNormalizationStrategy === NormalizationStrategy.BLOW) {
      min = 351147229;
      max = 897135635;
    } else if (this.selectedNormalizationStrategy === NormalizationStrategy.EXHALE) {
      min = 436542358;
      max = 469441172
    }

    // Log min and max readings in development
    if (!environment.production) {
      if (rawValue > this.maxReading) {
        this.maxReading = rawValue;
        console.log("New raw max reading", this.maxReading);
      }
      if (rawValue < this.minReading) {
        this.minReading = rawValue;
        console.log("New raw min reading", this.minReading);
      }
    }
    return +normalize(rawValue, min, max).toFixed(2);
  }

  getStrategyValues(): void {

  }

  get device(): Observable<BluetoothDevice> {
    return this.gattService.getDevice();
  }
}
