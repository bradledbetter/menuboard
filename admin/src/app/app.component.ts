import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'mba-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private auth: AuthService) { }

  get loggedIn() {
    return this.auth.isAuthenticated();
  }
}
