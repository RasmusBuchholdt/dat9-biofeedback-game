import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';
import { ChartsModule } from 'ng2-charts';
import { NgxSpinnerModule } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

import { SpiromagicService } from './_services/spiromagic.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SetupComponent } from './setup/setup.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GraphComponent,
    NavbarComponent,
    SetupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    ChartsModule,
    WebBluetoothModule.forRoot({
      enableTracing: !environment.production
    })
  ],
  providers: [SpiromagicService],
  bootstrap: [AppComponent]
})
export class AppModule { }
