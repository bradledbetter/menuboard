import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PasswordValidatorService } from '../shared/password-validator/password-validator.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
})
export class NewPasswordComponent implements OnInit {
  newPasswordForm: FormGroup;
// todo: need to change this over to be a process of first enter email, then go to verification code and new password entry
  constructor(private fb: FormBuilder, private passwordValidator: PasswordValidatorService) {}

  ngOnInit() {
    this.newPasswordForm = this.fb.group({
      password: ['', this.passwordValidator.validators],
      newPassword: ['', this.passwordValidator.validators],
      confirmPassword: ['', this.passwordValidator.validators],
    });
  }

  changePassword() {
    window.alert('not implemented');
  }
}
