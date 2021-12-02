import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-calibration',
  templateUrl: './calibration.component.html',
  styleUrls: ['./calibration.component.scss']
})
export class CalibrationComponent implements OnInit, OnDestroy {

  calibrationProgress = 0;
  exhalationCompleted = false;
  inhalationCompleted = false;

  private subscription: Subscription | null = null;

  constructor(
    private spiromagicService: SpiromagicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.spiromagicService.tutorialFinished$.getValue()) {
      this.router.navigateByUrl('/menu');
    } else {
      this.subscription = this.spiromagicService.calibrationProgress$.subscribe(calibrationProgress => {
        this.calibrationProgress = calibrationProgress;
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
