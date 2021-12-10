import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  title = 'dat9-game-website';

  constructor(private router: Router) {
    this.checkBrowserBluetoothSupport();
  }

  private async checkBrowserBluetoothSupport(): Promise<void> {
    let isSupported = false;
    if (navigator.bluetooth !== undefined) {
      isSupported = await navigator.bluetooth.getAvailability();
    };
    if (!isSupported) {
      this.router.navigateByUrl('/browser-not-supported');
    }
  }
}
