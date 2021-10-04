import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { take } from 'rxjs/operators';

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
    let isConnected = false;
    this.spiromagicService.device.pipe(take(1)).subscribe(device => {
      isConnected = device ? true : false;
    });
    if (!isConnected) {
      this.router.navigateByUrl('/');
    }
    return isConnected;
  }
}
