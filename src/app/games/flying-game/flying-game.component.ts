import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FlyingGameEngineService,
} from 'src/app/_services/flying-game-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-flying-game',
  templateUrl: './flying-game.component.html',
  styleUrls: ['./flying-game.component.scss']
})
export class FlyingGameComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;
  public screenshotBase64: ArrayBuffer | string;

  private subscription: Subscription | null;

  constructor(
    private gameEngine: FlyingGameEngineService,
    private spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
    this.gameEngine.initialize(this.rendererCanvas);
    // this.gameEngine.animate();
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.gameEngine.stopGame();
  }

  getReadings(): void {
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      // t
    })
  }
}
