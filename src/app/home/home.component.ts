import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { RenderingEngineService } from '../_services/rendering-engine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;

  constructor(
    private renderingService: RenderingEngineService
  ) {
  }

  ngOnInit(): void {
    this.renderingService.createScene(this.rendererCanvas);
    this.renderingService.animate();
  }

  takeScreenshot(): void {
  }
}
