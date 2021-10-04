import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { RenderingEngineService } from '../_services/rendering-engine.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;

  constructor(
    private renderingService: RenderingEngineService
  ) { }

  ngOnInit(): void {
    this.renderingService.createScene(this.rendererCanvas);
    this.renderingService.animate();
  }

  takeScreenshot(): void {
  }
}
