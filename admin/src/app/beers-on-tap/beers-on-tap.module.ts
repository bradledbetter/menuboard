import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BeersOnTapComponent } from './beers-on-tap.component';
import { BeersOnTapService } from './beers-on-tap.service';

@NgModule({
  declarations: [BeersOnTapComponent],
  imports: [CommonModule, HttpClientModule],
  providers: [BeersOnTapService],
  exports: [BeersOnTapComponent],
})
export class BeersOnTapModule {}
