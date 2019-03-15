import { TestBed } from '@angular/core/testing';

import { PasswordValidatorService } from './password-validator.service';

describe('PasswordValidatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PasswordValidatorService = TestBed.get(PasswordValidatorService);
    expect(service).toBeTruthy();
  });
});
