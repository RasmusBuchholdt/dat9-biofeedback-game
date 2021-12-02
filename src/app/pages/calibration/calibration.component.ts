import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-calibration',
  templateUrl: './calibration.component.html',
  styleUrls: ['./calibration.component.scss']
})
export class CalibrationComponent implements OnInit {

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
