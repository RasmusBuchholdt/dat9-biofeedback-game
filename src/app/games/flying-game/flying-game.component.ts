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
    })
  }

  takeScreenshot(): void {
    this.screenshotBase64 = this.gameEngine.takeSceneScreenshot();
  }

  resetGame(): void {
    this.gameEngine.resetGame();
  }

  downloadScreenshot() {
    const d = new Date();
    const dateString = `${d.getFullYear().toString().padStart(4, '0')}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}-${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}${d.getSeconds().toString().padStart(2, '0')}`
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", this.screenshotBase64.toString());
    downloadAnchorNode.setAttribute("download", `screenshot ${dateString}.png`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}
