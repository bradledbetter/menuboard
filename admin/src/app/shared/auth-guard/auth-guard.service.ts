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
    return new Promise((resolve) => {
      this.userService.isAuthenticated((message: string, loggedIn: boolean) => {
        console.log(`userService.isAuthenticated message: ${message}`);
        // todo: do I want to do anything more with that message? A toast?
        if (!loggedIn) {
          resolve(this.router.parseUrl('/login'));
        } else {
          resolve(loggedIn);
        }
      });
    });
  }
}
