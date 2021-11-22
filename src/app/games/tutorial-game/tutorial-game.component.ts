import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';
import {
  TutorialGameEngineService,
} from 'src/app/_services/tutorial-game-engine.service';

@Component({
  selector: 'app-tutorial-game',
  templateUrl: './tutorial-game.component.html',
  styleUrls: ['./tutorial-game.component.scss']
})
export class TutorialGameComponent implements OnInit, OnDestroy {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;
  public screenshotBase64: ArrayBuffer | string;

  private subscription: Subscription | null;

  constructor(
    private gameEngine: TutorialGameEngineService,
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
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.gameEngine.setInnerCircle(reading);
    });
  }
}
