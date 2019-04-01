export interface PasswordConfigOptions {
  minLength: number;
  requireLowercase: true;
  requireUppercase: true;
  requireNumber: true;
  requireSpecialChars: true;
}

export class PWRE {
  private readonly lowerCase = 'a-z';
  private readonly upperCase = 'A-Z';
  private readonly specialChars = '$#@!&^*%~';
  private readonly digit = '0-9';

  options: PasswordConfigOptions;
  constructor(options: PasswordConfigOptions) {
    this.options = options;
  }

  private lookAhead(group) {
    return `(?=(.*[${group}])+)`;
  }

  get regex(): RegExp {
    let patternStart = '^';
    let patternChars = '';
    const patternEnd = `{${this.options.minLength},}$`;

    if (this.options.requireLowercase) {
      patternStart += this.lookAhead(this.lowerCase);
      patternChars += this.lowerCase;
    }

    if (this.options.requireUppercase) {
      patternStart += this.lookAhead(this.upperCase);
      patternChars += this.upperCase;
    }

    if (this.options.requireNumber) {
      patternStart += this.lookAhead(this.digit);
      patternChars += this.digit;
    }

    if (this.options.requireSpecialChars) {
      patternStart += this.lookAhead(this.specialChars);
      patternChars += this.specialChars;
    }

    patternStart += '(?!.*s)'; // no whitespace

    // e.g. /^(?=(.*[a-z])+)(?=(.*[A-Z])+)(?=(.*[\d])+)(?=(.*[$#@!&^*%~])+)(?!.*\s)[$#@!&^*%~a-zA-Z\d]{8,}$/
    return new RegExp(patternStart + `[${patternChars}]` + patternEnd);
  }
}
