import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpiroMagicService {

  static GATT_PRIMARY_SPIROMAGIC_SERVICE = '73ab1200-a251-4c85-0f8c-d8db000021df';
  static GATT_CHARACTERISTIC_READING = '73ab1201-a251-4c85-0f8c-d8db000021df';

  constructor(
    public bluetoothService: BluetoothCore
  ) { }

  getDevice() {
    return this.bluetoothService.getDevice$();
  }

  getFakeValue() {
    this.bluetoothService.fakeNext();
  }

  stream() {
    return this.bluetoothService.streamValues$().pipe(map((value: DataView) => value));
  }

  disconnectDevice() {
    this.bluetoothService.disconnectDevice();
  }

  // Min and max is where the hardware caps
  private normalize(val: number, min: number = 26804568, max: number = 2107080156) {
    return (val - min) / (max - min) * 100;
  }

  private convertValue(value: DataView): number {
    return +this.normalize(value.getInt32(1, true)).toFixed(2);
  }

  // Returns a value from 0.0-1.0
  value() {
    return this.bluetoothService
      // Trigger the discovery process
      .discover$({
        acceptAllDevices: true,
        optionalServices: [SpiroMagicService.GATT_PRIMARY_SPIROMAGIC_SERVICE]
      })
      .pipe(
        // Get the service
        mergeMap((gatt: BluetoothRemoteGATTServer) => {
          return this.bluetoothService.getPrimaryService$(gatt, SpiroMagicService.GATT_PRIMARY_SPIROMAGIC_SERVICE);
        }),
        // Get the characteristic for the given service
        mergeMap((primaryService: BluetoothRemoteGATTService) => {
          return this.bluetoothService.getCharacteristic$(primaryService, SpiroMagicService.GATT_CHARACTERISTIC_READING);
        }),
        // Get the value of that characteristic in form of a DataView
        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.bluetoothService.readValue$(characteristic);
        }),
        // Work some magic on teh value
        map((value: DataView) => this.convertValue(value))
      )
  }
}
