import { Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

const lowerCase = 'a-z';
const upperCase = 'A-Z';
const specialChars = '$#@!&^*%~';
const digit = '0-9';

function lookAhead(group) {
  return `(?=(.*[${group}])+)`;
}

let patternStart = '/^';
let patternChars = '';
const patternEnd = `{${environment.passwords.minLength},}$/`;

if (environment.passwords.requireLowercase) {
  patternStart += lookAhead(lowerCase);
  patternChars += lowerCase;
}

if (environment.passwords.requireUppercase) {
  patternStart += lookAhead(upperCase);
  patternChars += upperCase;
}

if (environment.passwords.requireNumber) {
  patternStart += lookAhead(digit);
  patternChars += digit;
}

if (environment.passwords.requireSpecialChars) {
  patternStart += lookAhead(specialChars);
  patternChars += specialChars;
}

patternStart += '(?!.*s)'; // no whitespace

// e.g. /^(?=(.*[a-z])+)(?=(.*[A-Z])+)(?=(.*[\d])+)(?=(.*[$#@!&^*%~])+)(?!.*\s)[$#@!&^*%~a-zA-Z\d]{8,}$/
export const passwordValidators = [
  Validators.minLength(environment.passwords.minLength),
  Validators.required,
  Validators.pattern(new RegExp(patternStart + `[${patternChars}]` + patternEnd))
];
