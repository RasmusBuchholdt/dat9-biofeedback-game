import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';

import { ConnectedGuard } from './_guards/connected.guard';
import { TutorialGuard } from './_guards/tutortial.guard';
import {
  BalloonGameComponent,
} from './games/balloon-game/balloon-game.component';
import {
  CoinCollectorGameComponent,
} from './games/coin-collector-game/coin-collector-game.component';
import {
  CalibrationComponent,
} from './pages/calibration/calibration.component';
import { ConnectComponent } from './pages/connect/connect.component';
import { DeveloperComponent } from './pages/developer/developer.component';
import { MenuComponent } from './pages/menu/menu.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TutorialComponent } from './pages/tutorial/tutorial.component';

const routes: Routes = [
  {
    path: '',
    component: ConnectComponent
  },
  {
    path: 'calibration',
    canActivate: environment.production ? [ConnectedGuard] : [],
    component: CalibrationComponent
  },
  {
    path: 'tutorial',
    canActivate: environment.production ? [ConnectedGuard] : [],
    component: TutorialComponent
  },
  {
    path: 'settings',
    canActivate: environment.production ? [ConnectedGuard, TutorialGuard] : [],
    component: SettingsComponent
  },
  {
    path: 'menu',
    canActivate: environment.production ? [ConnectedGuard, TutorialGuard] : [],
    component: MenuComponent
  },
  {
    path: 'application',
    canActivate: environment.production ? [ConnectedGuard, TutorialGuard] : [],
    children: [
      {
        path: 'coin-collector',
        component: CoinCollectorGameComponent
      },
      {
        path: 'balloon',
        component: BalloonGameComponent
      }
    ]
  },
  {
    path: 'developer',
    component: DeveloperComponent
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
