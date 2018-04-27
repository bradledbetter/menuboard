import { AuthService } from './../auth/auth.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mba-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // https://github.com/cornflourblue/angular2-registration-login-example-cli
  public passwordMinLength = 12;
  public email: FormControl;
  public password: FormControl;

  constructor(private formBuilder: FormBuilder,
    private auth: AuthService) { }

  ngOnInit() {
    this.email = this.formBuilder.control('', [Validators.required, Validators.email]);
    this.password = this.formBuilder.control('', [Validators.required, Validators.minLength(this.passwordMinLength)]);
    // TODO: password format custom validator
  }

  /**
   * Handle login button click by logging in
   */
  login() {
    // TODO:
    this.auth
      .login(this.email.value, this.password.value)
      .subscribe((retVal) => {
        // TODO: set session
        console.log('logged in');
      });
  }

}
