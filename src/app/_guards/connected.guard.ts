import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { SpiromagicService } from '../_services/spiromagic.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectedGuard implements CanActivate {
  public constructor(
    private spiromagicService: SpiromagicService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let isConnected = this.spiromagicService.connected;
    if (!isConnected) {
      this.router.navigateByUrl('/');
    }
    return isConnected;
  }
}
