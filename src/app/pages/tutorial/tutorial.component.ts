import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';
import {
  TutorialEngineService,
} from 'src/app/_services/tutorial-engine.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit, OnDestroy {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;

  tutorialStarted = false;
  sensitivity: number;

  private subscriptions: Subscription[] = [];

  constructor(
    public spiromagicService: SpiromagicService,
    private tutorialEngine: TutorialEngineService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tutorialEngine.createScene(this.rendererCanvas);
    this.tutorialEngine.animate();
    this.setupSpirometer();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(e => e?.unsubscribe());
    this.tutorialEngine.stopGame();
  }

  private setupSpirometer(): void {
    this.subscriptions.push(this.spiromagicService.sensitivity$.subscribe(sensitivity => {
      this.sensitivity = sensitivity;
    }));
    this.subscriptions.push(this.spiromagicService.reading$.subscribe(reading => {
      this.handleReading(reading);
    }));
  }

  private handleReading(value: number): void {
    this.tutorialEngine.setInnerCircle(value);
  }

  finish(): void {
    this.spiromagicService.setTutorialCompleted(true);
    this.tutorialEngine.stopGame();
    this.router.navigateByUrl('menu');
  }

  changeSensitivity(value: number): void {
    this.spiromagicService.sensitivity$.next(value);
  }
}
