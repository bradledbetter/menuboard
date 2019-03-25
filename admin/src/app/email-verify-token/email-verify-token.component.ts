import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-email-verify-token',
  templateUrl: './email-verify-token.component.html',
  styleUrls: ['./email-verify-token.component.css'],
})
export class EmailVerifyTokenComponent implements OnInit {
  email: FormControl;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.email = this.fb.control(params.get('email'), [Validators.required]);
    });
  }

  verify() {
    window.alert('not done yet');
  }
}
