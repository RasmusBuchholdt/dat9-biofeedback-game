import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BatteryLevelComponent } from './battery-level/battery-level.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'battery',
    component: BatteryLevelComponent
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
