import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { ConfigService } from './../config/config.service';
@Injectable()
export class AuthService {
  private baseHeaders: HttpHeaders;

  constructor(private http: HttpClient,
    private config: ConfigService) {
    this.baseHeaders = new HttpHeaders({
      Accept: 'application/json',
      'Content-type': 'application/json'
    });
  }

  /**
   * Call to login
   * @param {string} username the username to login with
   * @param {string} password the password to login with
   * @returns {Observable}
   * @throws on API error, for now
   */
  login(username: string, password: string): Observable<any> {
    // TODO: check that this works, clean up bugs, figure out what I want to do with API errors
    return this.http.post(this.config.get('api') + '/login', { username, password }, { headers: this.baseHeaders })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      });
  }

  /**
   * Logout a user
   * @returns {Observable}
   * @throws on API error, for now
   */
  logout(): Observable<any> {
    // TODO: check that this works, clean up bugs, figure out what I want to do with API errors
    return this.http.post(this.config.get('api') + '/logout', {}, { headers: this.baseHeaders })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      });
  }

  /**
   * Check whether or not someone is logged in or not
   * @returns {boolean} true if someone is authenticated, false otherwise
   */
  isAuthenticated() {
    // TODO: check with session
    return false;
  }
}
