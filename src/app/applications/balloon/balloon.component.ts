import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  public instructions = "";

  private subscription: Subscription | null;

  constructor(
    private engine: BalloonEngineService,
    private spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
    this.engine.createScene(this.rendererCanvas);
    this.engine.animate();
    this.getReadings();

    if (history.state.guidance) {
      this.engine.guidance = true;
      this.instructions =
        `In this application, you will slowly inhale through your nose for 4 seconds and slowly exhale into the SpiroMagic for 6 seconds. Repeat this 10 times.</br></br>
      The yellow circle in the middle will follow your breathing. The red circle expands for 6 seconds, the same rate that you should breathe in the exercise. The yellow circle will turn green when your breath follows this closely.
      `;
    } else {
      this.instructions =
        `In this application, you will slowly inhale through your nose for 4 seconds and slowly exhale into the SpiroMagic for 6 seconds. Repeat this 10 times.</br></br>
        The yellow circle in the middle will follow your breathing.
      `;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.engine.stop();
  }

  getReadings(): void {
    this.spiromagicService.calibration$.next(new DynamicStepperCalibration())
    this.subscription = this.spiromagicService.reading$.subscribe(reading => {
      this.engine.setInnerCircle(reading);
    });
  }
}
