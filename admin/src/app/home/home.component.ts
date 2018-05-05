import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mba-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() {
    console.log('home comp construct');
  }

  ngOnInit() {
    console.log('home comp on init');
  }

}
