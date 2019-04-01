import { Injectable } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { environment } from './../../../environments/environment';
import { PWRE, PasswordConfigOptions } from './pwre/pwre';

@Injectable({ providedIn: 'root' })
export class PasswordValidatorService {
  static pwre: PWRE;

  constructor() {
    PasswordValidatorService.pwre = new PWRE(environment.passwords as PasswordConfigOptions);
  }

  // todo break apart the pieces of the pattern match and put back a validators getter that responds to the config
  password(control: AbstractControl) {
    const validations = {};

    if (!control.value.length) {
      validations['required'] = true;
    } else {
      if (control.value.length < environment.passwords.minLength) {
        validations['passwordLength'] = true;
      }

      if (control.value.match(PasswordValidatorService.pwre.regex) === null) {
        validations['passwordFormat'] = true;
      }
    }

    return Object.keys(validations).length ? validations : null;
  }
}
