import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  constructor() { }

  /**
   * Check whether or not someone is logged in or not
   * @returns {boolean} true if someone is authenticated, false otherwise
   */
  isAuthenticated() {
    return false;
  }
}
