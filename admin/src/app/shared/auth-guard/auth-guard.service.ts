import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { UserService } from './../user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return Observable.create((subscriber: Subscriber<boolean>) => {
      this.userService.isAuthenticated((message: string, loggedIn: boolean) => {
        // todo: do I want to do anything more with that message? A toast?
        subscriber.next(loggedIn);
      });
    });
  }
}
