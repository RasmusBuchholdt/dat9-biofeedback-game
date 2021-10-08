import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { RenderingEngineService } from '../_services/rendering-engine.service';
import { SpiromagicService } from '../_services/spiromagic.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;
  public screenshotBase64: ArrayBuffer | string;

  private subscription: Subscription | null;

  constructor(
    private renderingService: RenderingEngineService,
    private spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
    this.renderingService.createScene(this.rendererCanvas);
    this.renderingService.animate();
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.renderingService.stopGame();
  }

  getReadings(): void {
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.renderingService.setInnerCircle(reading);
    })
  }

  takeScreenshot(): void {
    this.screenshotBase64 = this.renderingService.takeSceneScreenshot();
  }

  resetGame(): void {
    this.renderingService.resetGame();
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
