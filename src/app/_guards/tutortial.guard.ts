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
export class TutorialGuard implements CanActivate {
  public constructor(
    private spiromagicService: SpiromagicService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let tutorialFinished = this.spiromagicService.tutorialFinished$.getValue();
    if (!tutorialFinished) {
      this.router.navigateByUrl('/game/tutorial');
    }
    return tutorialFinished;
  }
}
