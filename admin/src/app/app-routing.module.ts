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
        redirectTo: 'app',
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
        path: 'beers-on-tap',
        loadChildren: './login/login.module#LoginModule',
      },
      // {
      //   path: 'not-found',
      //   loadChildren: './not-found/not-found.module#NotFoundModule',
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
