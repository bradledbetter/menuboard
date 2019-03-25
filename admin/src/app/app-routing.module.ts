import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadChildren: './login/login.module#LoginModule',
      },
      {
        path: 'new-password',
        loadChildren: './new-password/new-password.module#NewPasswordModule',
      },
      {
        path: 'verify-email',
        loadChildren: './email-verify-token/email-verify-token.module#EmailVerifyTokenModule',
      },
      {
        path: 'beers-on-tap',
        loadChildren: './login/login.module#LoginModule',
      },
      {
        path: 'not-found',
        loadChildren: './not-found/not-found.module#NotFoundModule',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
