import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  PushHardCalibration,
} from 'src/app/_models/calibration/push-hard-calibration';
import {
  KiwiGameEngineService,
} from 'src/app/_services/kiwi-game-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-kiwi-game',
  templateUrl: './kiwi-game.component.html',
  styleUrls: ['./kiwi-game.component.scss']
})
export class KiwiGameComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;
  public screenshotBase64: ArrayBuffer | string;

  private subscription: Subscription | null;

  constructor(
    private gameEngine: KiwiGameEngineService,
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
    this.spiromagicService.calibration$.next(new PushHardCalibration())
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      // this.gameEngine.updatePlane(reading);
      this.gameEngine.updatePlaneSmooth(reading);
    })
  }
}
