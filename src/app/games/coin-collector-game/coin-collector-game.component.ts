import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  CoinCollectorGameEngineService,
} from 'src/app/_services/games/coin-collector-game-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-coin-collector-game',
  templateUrl: './coin-collector-game.component.html',
  styleUrls: ['./coin-collector-game.component.scss']
})
export class CoinCollectorGameComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;
  public coinsCollected = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private gameEngine: CoinCollectorGameEngineService,
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
    // this.spiromagicService.calibration$.next(new ConstantStepperCalibration());
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading  => {
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
