import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';

import { ConnectedGuard } from './_guards/connected.guard';
import { TutorialGuard } from './_guards/tutortial.guard';
import { CalibrationComponent } from './calibration/calibration.component';
import {
  BalloonGameComponent,
} from './games/balloon-game/balloon-game.component';
import { KiwiGameComponent } from './games/kiwi-game/kiwi-game.component';
import { ConnectComponent } from './pages/connect/connect.component';
import {
  SimpleCalibrationComponent,
} from './pages/simple-calibration/simple-calibration.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'connect',
  },
  {
    path: 'connect',
    canActivate: environment.production ? [ConnectedGuard] : [],
    component: ConnectComponent
  },
  {
    path: 'calibration',
    canActivate: environment.production ? [ConnectedGuard] : [],
    component: SimpleCalibrationComponent
  },
  {
    path: 'settings',
    canActivate: environment.production ? [ConnectedGuard, TutorialGuard] : [],
    component: SimpleCalibrationComponent
  },
  {
    path: 'menu',
    canActivate: environment.production ? [ConnectedGuard, TutorialGuard] : [],
    component: SimpleCalibrationComponent
  },
  {
    path: 'game',
    canActivate: environment.production ? [ConnectedGuard] : [],
    children: [
      {
        canActivate: environment.production ? [TutorialGuard] : [],
        path: 'kiwi',
        component: KiwiGameComponent
      },
      {
        canActivate: environment.production ? [TutorialGuard] : [],
        path: 'balloon',
        component: BalloonGameComponent
      }
    ]
  },
  {
    path: 'developer',
    children: [
      {
        path: 'calibration',
        canActivate: environment.production ? [ConnectedGuard] : [],
        component: CalibrationComponent
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
