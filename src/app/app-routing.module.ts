import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GraphComponent } from './graph/graph.component';
import { HomeComponent } from './home/home.component';
import { SetupComponent } from './setup/setup.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'setup',
    component: SetupComponent
  },
  {
    path: 'graph',
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
