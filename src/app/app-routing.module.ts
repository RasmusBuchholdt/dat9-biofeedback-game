import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';

import { ConnectedGuard } from './_guards/connected.guard';
import { TutorialGuard } from './_guards/tutortial.guard';
import { CalibrationComponent } from './calibration/calibration.component';
import {
  BalloonGameComponent,
} from './games/balloon-game/balloon-game.component';
import { CircleGameComponent } from './games/circle-game/circle-game.component';
import { FlyingGameComponent } from './games/flying-game/flying-game.component';
import { KiwiGameComponent } from './games/kiwi-game/kiwi-game.component';
import {
  TutorialGameComponent,
} from './games/tutorial-game/tutorial-game.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
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
        path: 'circle',
        component: CircleGameComponent
      },
      {
        canActivate: environment.production ? [TutorialGuard] : [],
        path: 'flying',
        component: FlyingGameComponent
      },
      {
        canActivate: environment.production ? [TutorialGuard] : [],
        path: 'balloon',
        component: BalloonGameComponent
      },
      {
        path: 'tutorial',
        component: TutorialGameComponent
      }
    ]
  },
  {
    path: 'calibration',
    canActivate: environment.production ? [ConnectedGuard] : [],
    component: CalibrationComponent
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
