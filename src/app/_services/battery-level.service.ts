import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpiroMagicService {

  static GATT_PRIMARY_SPIROMAGIC_SERVICE = '73ab1200-a251-4c85-0f8c-d8db000021df';
  static GATT_CHARACTERISTIC_PRESSURE = '73ab1201-a251-4c85-0f8c-d8db000021df';

  constructor(public ble: BluetoothCore) { }

  getDevice() {
    return this.ble.getDevice$();
  }

  getFakeValue() {
    this.ble.fakeNext();
  }

  stream() {
    return this.ble.streamValues$().pipe(map((value: DataView) => value));
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
  }

  value() {
    return this.ble
      // Trigger the discovery process
      .discover$({
        acceptAllDevices: true,
        optionalServices: [SpiroMagicService.GATT_PRIMARY_SPIROMAGIC_SERVICE]
      })
      .pipe(
        // Get the service
        mergeMap((gatt: BluetoothRemoteGATTServer) => {
          return this.ble.getPrimaryService$(gatt, SpiroMagicService.GATT_PRIMARY_SPIROMAGIC_SERVICE);
        }),
        // Get the characteristic for the given service
        mergeMap((primaryService: BluetoothRemoteGATTService) => {
          return this.ble.getCharacteristic$(primaryService, SpiroMagicService.GATT_CHARACTERISTIC_PRESSURE);
        }),
        // Get the value of that characteristic in form of a DataView
        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.ble.readValue$(characteristic);
        }),
        // Work some magic on teh value
        map((value: DataView) => value)
      )
  }
}
