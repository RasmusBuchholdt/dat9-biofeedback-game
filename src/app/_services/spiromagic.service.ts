import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

import { normalize } from '../_utils/normalize';
import { GATTCharacteristicService } from './gatt-characteristic.service';

@Injectable({
  providedIn: 'root'
})
export class SpiromagicService implements OnDestroy {

  public connected = false;
  public reading$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
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

  private maxReading = 0;
  private minReading = Number.MAX_SAFE_INTEGER;

  private convertValue(value: DataView): number {
    const rawValue = value.getInt32(1, true);

    // Hardware capped values:
    // Min: 26804568
    // Max: 2110814406

    // Human blow reachable values:
    // Min: 351147229
    // Max: 897135635

    // Human exhale reachable values:
    // Min: 436542358
    // Max: 469441172

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
    return +normalize(rawValue, 436542358, 469441172).toFixed(2);
  }

  get device(): Observable<BluetoothDevice> {
    return this.gattService.getDevice();
  }
}
