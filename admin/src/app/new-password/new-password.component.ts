import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { PasswordValidatorService } from '../shared/password-validator/password-validator.service';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
})
export class NewPasswordComponent implements OnInit {
  newPasswordForm: FormGroup;
  minPasswordLength = environment.passwords.minLength;

  constructor(
    private fb: FormBuilder,
    private passwordValidator: PasswordValidatorService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.newPasswordForm = this.fb.group({
        email: [params.get('email') || '', [Validators.required]],
        password: ['', this.passwordValidator.password],
        newPassword: ['', this.passwordValidator.password],
        confirmPassword: ['', this.passwordValidator.password],
      });
    });
  }

  changePassword() {
    const { email, password, newPassword } = this.newPasswordForm.value;
    this.userService
      .newPassword(email, password, newPassword)
      .then((userAttribs) => {
        console.log('successfully changed password: ', userAttribs);
        this.router.navigate(['beers-on-tap']);
      })
      .catch((err) => console.error);
  }

  comparePasswords() {
    const newPassword = this.newPasswordForm.get('newPassword').value;
    const confirmPassword = this.newPasswordForm.get('confirmPassword').value;
    if (newPassword !== confirmPassword) {
      this.newPasswordForm.controls['confirmPassword'].setErrors({ nomatch: true });
    } else {
      this.newPasswordForm.controls['confirmPassword'].setErrors({ nomatch: false });
    }
  }

  get confirmPasswordControl(): AbstractControl {
    if (this.newPasswordForm && this.newPasswordForm.controls) {
      return this.newPasswordForm.controls['confirmPassword'];
    }
    return undefined;
  }

  get newPasswordControl(): AbstractControl {
    if (this.newPasswordForm && this.newPasswordForm.controls) {
      return this.newPasswordForm.controls['newPassword'];
    }
    return undefined;
  }
}
