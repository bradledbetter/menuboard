import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { PasswordValidatorService } from './../shared/password-validator/password-validator.service';
import { AuthCode, AuthResult } from './../shared/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private passwordValidator: PasswordValidatorService,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.passwordValidator.validators],
    });
  }

  login() {
    this.userService
      .authenticate(this.loginForm.get('email').value, this.loginForm.get('password').value)
      .then((result: AuthResult) => {
        console.log(result);
        this.router.navigate(['beers-on-tap']);
      })
      .catch((result: AuthResult) => {
        console.log(result);
        this.snackbar.open(result.message, '', { duration: 3000 });
        if (result.code === AuthCode.PasswordChangeRequired) {
          this.router.navigate(['new-password', 'email', this.loginForm.get('email').value]);
        }
      });
  }
}
