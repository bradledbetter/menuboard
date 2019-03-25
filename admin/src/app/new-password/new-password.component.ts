import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PasswordValidatorService } from '../shared/password-validator/password-validator.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
})
export class NewPasswordComponent implements OnInit {
  newPasswordForm: FormGroup;
  constructor(private fb: FormBuilder, private passwordValidator: PasswordValidatorService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.newPasswordForm = this.fb.group({
        token: [params.get('token') || '', [Validators.required]],
        password: ['', this.passwordValidator.validators],
        newPassword: ['', this.passwordValidator.validators],
        confirmPassword: ['', this.passwordValidator.validators],
      });
    });
  }

  changePassword() {
    window.alert('not implemented');
  }
}
