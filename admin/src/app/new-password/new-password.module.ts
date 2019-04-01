import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { PasswordValidatorService } from './../shared/password-validator/password-validator.service';
import { SharedModule } from './../shared/shared.module';
import { NewPasswordRoutingModule } from './new-password-routing.module';
import { NewPasswordComponent } from './new-password.component';

@NgModule({
  declarations: [NewPasswordComponent],
  imports: [
    CommonModule,
    NewPasswordRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class NewPasswordModule {}
