import { DynamicStepperCalibration } from './../../_models/calibration/dynamic-stepper-calibration';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BalloonEngineService } from 'src/app/_services/balloon-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

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
    private spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
    this.gameEngine.createScene(this.rendererCanvas);
    this.gameEngine.animate();
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.gameEngine.stopGame();
  }

  getReadings(): void {
    this.spiromagicService.calibration$.next(new DynamicStepperCalibration())
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.gameEngine.setParticleRotation(reading);
      this.gameEngine.setInnerCircle(reading);
    })
  }
}
