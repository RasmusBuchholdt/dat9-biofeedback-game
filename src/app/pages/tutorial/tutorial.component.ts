import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class TutorialComponent implements OnInit {

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
    this.setupSpirometer();
  }

  private setupSpirometer(): void {
    this.subscriptions.push(this.spiromagicService.sensitivity$.subscribe(sensitivity => {
      this.sensitivity = sensitivity;
    }));
  }

  start(): void {
    this.tutorialStarted = true;
    this.tutorialEngine.createScene(this.rendererCanvas);
    this.tutorialEngine.animate();
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
