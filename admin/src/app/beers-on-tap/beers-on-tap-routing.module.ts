import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeersOnTapComponent } from './beers-on-tap.component';

const routes: Routes = [
  {
    path: '',
    component: BeersOnTapComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule { }
