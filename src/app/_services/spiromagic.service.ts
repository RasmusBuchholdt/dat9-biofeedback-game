import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

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
      .stream('73ab1200-a251-4c85-0f8c-d8db000021df', '73ab1201-a251-4c85-0f8c-d8db000021df')
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

  // Min and max is where the hardware caps
  private normalize(val: number, min: number = 26804568, max: number = 2107080156) {
    return (val - min) / (max - min) * 100;
  }

  private convertValue(value: DataView): number {
    return +this.normalize(value.getInt32(1, true)).toFixed(2);
  }

  get device(): Observable<BluetoothDevice> {
    return this.gattService.getDevice();
  }
}
