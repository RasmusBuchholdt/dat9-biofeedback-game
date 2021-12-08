import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  BalloonEngineService,
} from 'src/app/_services/games/balloon-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

import {
  DynamicStepperCalibration,
} from './../../_models/calibration/dynamic-stepper-calibration';

@Component({
  selector: 'app-balloon-game',
  templateUrl: './balloon-game.component.html',
  styleUrls: ['./balloon-game.component.scss']
})
export class BalloonGameComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;

  private subscription: Subscription | null;

  constructor(
    private gameEngine: BalloonEngineService,
    private spiromagicService: SpiromagicService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.gameEngine.createScene(this.rendererCanvas);
    this.gameEngine.animate();
    this.getReadings();
    this.toastrService.info(`
      In this application you will perform the pursed lip breathing exercise like you did in the tutorial.</br>
      When you exhale through the SpiroMagic device, the inner circle will expand.</br>
      Try to expand it enough that it reaches the outer circle.`, `Controls`, {
      disableTimeOut: true,
      closeButton: true,
      positionClass: 'toast-bottom-left'
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.gameEngine.stopGame();
    this.toastrService.clear();
  }

  getReadings(): void {
    this.spiromagicService.calibration$.next(new DynamicStepperCalibration())
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.gameEngine.setParticleRotation(reading);
      this.gameEngine.setInnerCircle(reading);
    });
  }
}
