import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './../shared/auth-guard/auth-guard.service';
import { BeersOnTapComponent } from './beers-on-tap.component';

const routes: Routes = [
  {
    path: '',
    component: BeersOnTapComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeersOnTapRoutingModule { }
