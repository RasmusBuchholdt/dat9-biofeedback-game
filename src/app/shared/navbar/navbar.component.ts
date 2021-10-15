import { Component, OnInit } from '@angular/core';
import { SpiromagicService } from 'src/app/_services/spiromagic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  isProduction = environment.production;

  constructor(
    public spiromagicService: SpiromagicService
  ) { }

  ngOnInit(): void {
  }

}
