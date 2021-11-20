import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  public coinsCollected = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private gameEngine: KiwiGameEngineService,
    private zone: NgZone,
    private spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
    this.gameEngine.createScene(this.rendererCanvas);
    this.gameEngine.animate();
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(e => e?.unsubscribe());
    this.gameEngine.stopGame();
  }

  getReadings(): void {
    this.spiromagicService.calibration$.next(new PushHardCalibration());
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading  => {
      // this.gameEngine.updatePlane(reading);
      this.gameEngine.setCharacterPosition(reading);
    }));
    this.subscriptions.push(this.gameEngine.coinsCollected$.subscribe(coinsCollected => {
      this.zone.run(() => this.coinsCollected = coinsCollected);
    }));
  }

  resetGame(): void {
    // this.gameEngine.resetGame();
  }
}
