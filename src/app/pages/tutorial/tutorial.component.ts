import { Component, OnInit } from '@angular/core';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {

  tutorialStarted = false;

  constructor(
    public spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
  }

}
