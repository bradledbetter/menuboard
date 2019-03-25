import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-token-sent',
  templateUrl: './token-sent.component.html',
  styleUrls: ['./token-sent.component.css'],
})
export class TokenSentComponent implements OnInit {
  email = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.email = params.get('email') || '';
    });
  }
}
