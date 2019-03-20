import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { BeersOnTapService } from './beers-on-tap.service';

@Component({
  selector: 'app-beers-on-tap',
  templateUrl: './beers-on-tap.component.html',
  styleUrls: ['./beers-on-tap.component.css'],
})
export class BeersOnTapComponent implements OnInit {
  constructor(private dataService: BeersOnTapService, private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.dataService.loadList([]).subscribe(
      (results) => {
        console.log(results);
      },
      (err) => {
        console.error(err);
        this.snackbar.open('There was an error getting tap list.', null, { duration: 3000 });
      },
    );
  }
}
