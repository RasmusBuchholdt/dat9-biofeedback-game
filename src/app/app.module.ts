import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';
import { ChartsModule } from 'ng2-charts';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';

import { SpiromagicService } from './_services/spiromagic.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BalloonComponent } from './applications/balloon/balloon.component';
import {
  CoinCollectorComponent,
} from './applications/coin-collector/coin-collector.component';
import {
  CalibrationComponent,
} from './pages/calibration/calibration.component';
import { ConnectComponent } from './pages/connect/connect.component';
import { DeveloperComponent } from './pages/developer/developer.component';
import { MenuComponent } from './pages/menu/menu.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TutorialComponent } from './pages/tutorial/tutorial.component';
import { ChartComponent } from './applications/chart/chart.component';
import { BrowserNotSupportedComponent } from './pages/browser-not-supported/browser-not-supported.component';

@NgModule({
  declarations: [
    AppComponent,
    BalloonComponent,
    CoinCollectorComponent,
    CalibrationComponent,
    TutorialComponent,
    SettingsComponent,
    MenuComponent,
    ConnectComponent,
    DeveloperComponent,
    ChartComponent,
    BrowserNotSupportedComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    ChartsModule,
    WebBluetoothModule.forRoot({
      // enableTracing: !environment.production
    }),
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
      enableHtml: true
      // preventDuplicates: true,
    })
  ],
  providers: [SpiromagicService],
  bootstrap: [AppComponent]
})
export class AppModule { }
