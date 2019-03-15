import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { PWRE, PasswordConfigOptions } from './pwre/pwre';

@Injectable()
export class PasswordValidatorService {
  pwre: PWRE;

  constructor() {
    this.pwre = new PWRE(environment.passwords as PasswordConfigOptions);
  }

  get validators(): any[] {
    return [
      Validators.minLength(environment.passwords.minLength),
      Validators.required,
      Validators.pattern(this.pwre.regex)
    ];
  }
}
