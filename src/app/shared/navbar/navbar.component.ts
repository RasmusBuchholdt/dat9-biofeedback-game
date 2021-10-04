import { Component, OnInit } from '@angular/core';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
    public spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
  }

}
