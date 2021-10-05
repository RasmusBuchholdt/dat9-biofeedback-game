import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';

import { ConnectedGuard } from './_guards/connected.guard';
import { CalibrationComponent } from './calibration/calibration.component';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'game',
    canActivate: environment.production ? [ConnectedGuard] : [],
    component: GameComponent
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
