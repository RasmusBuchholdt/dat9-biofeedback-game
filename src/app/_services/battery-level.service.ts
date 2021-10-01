import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BatteryLevelService {

  static GATT_PRIMARY_SERVICE = '73ab1200-a251-4c85-0f8c-d8db000021df';
  static GATT_CHARACTERISTIC_BATTERY_LEVEL = '73ab1201-a251-4c85-0f8c-d8db000021df';

  constructor(public ble: BluetoothCore) { }

  getDevice() {
    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  getFakeValue() {
    this.ble.fakeNext();
  }

  stream() {
    // call this method to get a stream of values emitted by the device
    return this.ble.streamValues$().pipe(map((value: DataView) => value));
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
  }

  /**
   * Get Battery Level GATT Characteristic value.
   * This logic is specific to this service, this is why we can't abstract it elsewhere.
   * The developer is free to provide any service, and characteristics they want.
   *
   * @return Emites the value of the requested service read from the device
   */
  value() {
    console.log('Getting Battery level...');

    return this.ble

      // 1) call the discover method will trigger the discovery process (by the browser)
      .discover$({
        acceptAllDevices: true,
        optionalServices: [BatteryLevelService.GATT_PRIMARY_SERVICE]
      })
      .pipe(

        // 2) get that service
        // @ts-ignore
        mergeMap((gatt: BluetoothRemoteGATTServer) => {
          return this.ble.getPrimaryService$(gatt, BatteryLevelService.GATT_PRIMARY_SERVICE);
        }),

        // 3) get a specific characteristic on that service
        mergeMap((primaryService: BluetoothRemoteGATTService) => {
          return this.ble.getCharacteristic$(primaryService, BatteryLevelService.GATT_CHARACTERISTIC_BATTERY_LEVEL);
        }),

        // 4) ask for the value of that characteristic (will return a DataView)
        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.ble.readValue$(characteristic);
        }),

        // 5) on that DataView, get the right value
        map((value: DataView) => value)
      )
  }
}
