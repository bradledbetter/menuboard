import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { EmailVerifyTokenRoutingModule } from './email-verify-token-routing.module';
import { EmailVerifyTokenComponent } from './email-verify-token.component';
import { TokenSentComponent } from './token-sent.component';

@NgModule({
  declarations: [EmailVerifyTokenComponent, TokenSentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmailVerifyTokenRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class EmailVerifyTokenModule {}
