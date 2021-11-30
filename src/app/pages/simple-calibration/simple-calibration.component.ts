import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-simple-calibration',
  templateUrl: './simple-calibration.component.html',
  styleUrls: ['./simple-calibration.component.scss']
})
export class SimpleCalibrationComponent implements OnInit {

  exhalationCompleted = false;
  inhalationCompleted = false;

  constructor(
    public spiromagicService: SpiromagicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // TODO: Maybe remove this or move to better place?
    if (this.spiromagicService.tutorialFinished$.getValue()) {
      this.router.navigateByUrl('/menu');
    };
  }
}
