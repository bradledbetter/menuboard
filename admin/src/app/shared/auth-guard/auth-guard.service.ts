import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from './../user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(): Promise<boolean | UrlTree> {
    console.log('AuthGuardService.canActivate');
    return this.userService.isAuthenticated()
      .then((session) => {
        // todo: do I want to do anything more with that message? Snackbar?
        console.log('User is authenticated: ', session);
        return true;
      })
      .catch((error) => {
        console.error(`User isn't authenticated. Redirecting to login. Error: `, error);
        return Promise.resolve(this.router.parseUrl('/login'));
      });
  }
}
