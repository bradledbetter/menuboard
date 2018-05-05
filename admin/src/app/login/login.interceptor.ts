import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoginInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const headers = new HttpHeaders({
            Server: 'menuboard-server',
            'access-control-allow-origin': 'http://localhost:4200',
            vary: 'origin',
            'access-control-allow-credentials': 'true',
            'access-control-expose-headers': 'api-version, content-length, content-md5, content-type, date, request-id, response-time',
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'must-revalidate',
            // tslint:disable-next-line
            'Set-Cookie': 'session=LhCn-sJyKvcyk0WV1ONraA.QxaXH7-qrsZT_LHeq_HiUWnIW4Y2wLtZFT55SzYI8ExfjmGvVZe9CbepqNhy6H54XwkaP2iZcZb_efU7l4fqZQ.1525365312657.3600000.J02cqY4JUb458I3RVbEJZDJ1XWbTBib_yNcpWokO3Tc; path=/; expires=Thu, 03 May 2018 17:35:13 GMT',
            Date: 'Thu, 03 May 2018 16: 35: 12 GMT',
            Connection: 'keep-alive'
        });
        if (request.url.match(/login/) !== null) {
            return new Observable(resp => {
                resp.next(new HttpResponse({
                    status: 200,
                    body: { success: 'Logged in' },
                    headers
                }));
                resp.complete();
            });
        }
        return next.handle(request);
    }

}
