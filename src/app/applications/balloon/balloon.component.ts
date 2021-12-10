import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  BalloonEngineService,
} from 'src/app/_services/applications/balloon-engine.service';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

import {
  DynamicStepperCalibration,
} from '../../_models/calibration/dynamic-stepper-calibration';

@Component({
  selector: 'app-balloon',
  templateUrl: './balloon.component.html',
  styleUrls: ['./balloon.component.scss']
})
export class BalloonComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;

  private subscription: Subscription | null;

  constructor(
    private engine: BalloonEngineService,
    private spiromagicService: SpiromagicService,
    private toastrService: ToastrService,
  ) { }

  ngOnInit(): void {
    this.engine.createScene(this.rendererCanvas);
    this.engine.animate();
    this.getReadings();

    let hint = '';

    if (history.state.guidance) {
      this.engine.enableGuidance();
      hint =
        `....`;
    } else {
      hint =
        `In this application you will perform the pursed lip breathing exercise like you did in the tutorial.</br>
      When you exhale through the SpiroMagic device, the inner circle will expand.</br>
      Try to expand it enough that it reaches the outer circle.`;
    }

    this.toastrService.info(hint, `Controls`, {
      disableTimeOut: true,
      closeButton: true,
      positionClass: 'toast-bottom-left'
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.engine.stop();
    this.toastrService.clear();
  }

  getReadings(): void {
    this.spiromagicService.calibration$.next(new DynamicStepperCalibration())
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.engine.setInnerCircle(reading);
    });
  }
}
