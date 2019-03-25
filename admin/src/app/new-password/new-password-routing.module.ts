import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewPasswordComponent } from './new-password.component';

const routes: Routes = [
  {
    path: '/:token',
    component: NewPasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewPasswordRoutingModule { }
