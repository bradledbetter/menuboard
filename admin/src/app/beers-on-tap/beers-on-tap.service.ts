import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Beer } from './beers-on-tap.model';

@Injectable()
export class BeersOnTapService {
  private baseUrl = 'https://dev.api-menuviz.net/beers-on-tap';

  constructor(private http: HttpClient) {}

  getOnTap(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tapped`).pipe(tap((result) => {
      console.log(result);
    }));
  }
}
