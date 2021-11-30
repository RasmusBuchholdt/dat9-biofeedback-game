import { Component, OnInit } from '@angular/core';
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
    public spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
  }

}
