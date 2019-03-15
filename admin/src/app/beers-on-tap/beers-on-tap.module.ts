import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BeersOnTapRoutingModule } from './beers-on-tap-routing.module';
import { BeersOnTapComponent } from './beers-on-tap.component';
import { BeersOnTapService } from './beers-on-tap.service';

@NgModule({
  declarations: [BeersOnTapComponent],
  imports: [CommonModule, BeersOnTapRoutingModule, HttpClientModule],
  providers: [BeersOnTapService],
})
export class BeersOnTapModule {}
