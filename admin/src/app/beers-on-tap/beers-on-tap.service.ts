import { Beer } from './beers-on-tap.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BeersOnTapService {
  private baseUrl = 'https://dev.api-menuviz.net/beers-on-tap';

  constructor(private http: HttpClient) {}

  getOnTap(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tapped`);
  }
}
