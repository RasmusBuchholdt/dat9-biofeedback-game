import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CalibrationReadings } from 'src/app/_models/calibration-readings';
import {
  TutorialGameEngineService,
} from 'src/app/_services/games/tutorial-game-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

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

  private readingTarget: number;
  private exhalationCompleted = false;
  private inhalationCompleted = false;

  private toastrConfig = {
    timeOut: 10000,
    positionClass: 'toast-bottom-center',
    enableHtml: true
  };

  readings: CalibrationReadings | null = null;

  constructor(
    private gameEngine: TutorialGameEngineService,
    private spiromagicService: SpiromagicService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.gameEngine.createScene(this.rendererCanvas);
    this.gameEngine.animate();
    this.getReadings();
    this.start();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.gameEngine.stopGame();
  }

  getReadings(): void {
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.handleReading(reading);
    });
  }

  private start(): void {
    this.readingTarget = 100;
    this.toastrService.success(`Exhale until the circle is full and you hear a pling.`, 'Exhalation', this.toastrConfig);
  }

  private handleReading(value: number): void {
    this.gameEngine.setInnerCircle(value);

    if (value === this.readingTarget && !this.exhalationCompleted) {
      this.exhalationCompleted = true;
      this.readingTarget = 0;
      this.toastrService.success(`Inhale until the circle is empty and you hear a pling.`, 'Inhalation', this.toastrConfig);
    } else if (value === this.readingTarget && !this.inhalationCompleted) {
      this.inhalationCompleted = true;
      this.toastrService.success(`You have successfully completed the tutorial.`, 'Completed', this.toastrConfig);
      this.spiromagicService.markTutorialAsCompleted();
    }
  }
}
