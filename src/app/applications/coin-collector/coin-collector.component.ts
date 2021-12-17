import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Speed } from 'src/app/_models/applications/coin-collector';
import {
  CoinCollectorEngineService,
} from 'src/app/_services/applications/coin-collector-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-coin-collector',
  templateUrl: './coin-collector.component.html',
  styleUrls: ['./coin-collector.component.scss']
})
export class CoinCollectorComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;
  public coinsCollected = 0;
  public speed = Speed;

  private subscriptions: Subscription[] = [];

  constructor(
    private engine: CoinCollectorEngineService,
    private zone: NgZone,
    private spiromagicService: SpiromagicService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.engine.createScene(this.rendererCanvas);
    this.engine.animate();
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(e => e?.unsubscribe());
    this.engine.stop();
    this.toastrService.clear();
  }

  getReadings(): void {
    // this.spiromagicService.calibration$.next(new ConstantStepperCalibration());
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading => {
      this.engine.setCharacterPosition(reading);
    }));
    this.subscriptions.push(this.engine.coinsCollected$.subscribe(coinsCollected => {
      this.zone.run(() => this.coinsCollected = coinsCollected);
    }));
  }

  resetGame(): void {
    // this.engine.resetGame();
  }

  setGameSpeed(value: number): void {
    this.speed = value;
    this.engine.gameSpeed = value;
  }
}
