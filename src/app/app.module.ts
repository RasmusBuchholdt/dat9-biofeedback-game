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
import {
  BalloonGameComponent,
} from './games/balloon-game/balloon-game.component';
import {
  CoinCollectorGameComponent,
} from './games/coin-collector-game/coin-collector-game.component';
import { ConnectComponent } from './pages/connect/connect.component';
import { MenuComponent } from './pages/menu/menu.component';
import { SettingsComponent } from './pages/settings/settings.component';
import {
  SimpleCalibrationComponent,
} from './pages/simple-calibration/simple-calibration.component';
import { TutorialComponent } from './pages/tutorial/tutorial.component';
import { DeveloperComponent } from './pages/developer/developer.component';

@NgModule({
  declarations: [
    AppComponent,
    CoinCollectorGameComponent,
    BalloonGameComponent,
    SimpleCalibrationComponent,
    TutorialComponent,
    SettingsComponent,
    MenuComponent,
    ConnectComponent,
    DeveloperComponent
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
