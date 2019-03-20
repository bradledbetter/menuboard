import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { BeersOnTapRoutingModule } from './beers-on-tap-routing.module';
import { BeersOnTapComponent } from './beers-on-tap.component';
import { BeersOnTapService } from './beers-on-tap.service';

@NgModule({
  declarations: [BeersOnTapComponent],
  imports: [CommonModule, BeersOnTapRoutingModule, HttpClientModule, MatSnackBarModule, MatCardModule],
  providers: [BeersOnTapService],
})
export class BeersOnTapModule {}
