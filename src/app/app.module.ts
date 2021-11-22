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
import { CalibrationComponent } from './calibration/calibration.component';
import { CircleGameComponent } from './games/circle-game/circle-game.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FlyingGameComponent } from './games/flying-game/flying-game.component';
import { KiwiGameComponent } from './games/kiwi-game/kiwi-game.component';
import { BalloonGameComponent } from './games/balloon-game/balloon-game.component';
import { TutorialGameComponent } from './games/tutorial-game/tutorial-game.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CalibrationComponent,
    NavbarComponent,
    CircleGameComponent,
    FlyingGameComponent,
    KiwiGameComponent,
    BalloonGameComponent,
    TutorialGameComponent
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
