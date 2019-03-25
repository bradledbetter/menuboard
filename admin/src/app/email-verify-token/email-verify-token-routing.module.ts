import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailVerifyTokenComponent } from './email-verify-token.component';
import { TokenSentComponent } from './token-sent.component';

const routes: Routes = [
  {
    path: '/',
    component: EmailVerifyTokenComponent,
  },
  {
    path: '/:email',
    component: EmailVerifyTokenComponent,
  },
  {
    path: '/token-sent/:email',
    component: TokenSentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmailVerifyTokenRoutingModule {}
