import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConnectedGuard } from './_guards/connected.guard';
import { GameComponent } from './game/game.component';
import { GraphComponent } from './graph/graph.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'game',
    canActivate: [ConnectedGuard],
    component: GameComponent
  },
  {
    path: 'graph',
    canActivate: [ConnectedGuard],
    component: GraphComponent
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
