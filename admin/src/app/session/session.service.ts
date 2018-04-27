import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class SessionService {
    private cookieOptions = {
        path: '/',
        domain: 'localhost',
        httpOnly: true
    };

    constructor(private cookieService: CookieService) { }

    setValue(key: string, value: string) {
        return this.cookieService.put(key, value, this.cookieOptions);
    }

    getValue(key: string): string {
        return this.cookieService.get(key);
    }

    deleteValue(key: string) {
        this.cookieService.remove(key, this.cookieOptions);
    }

    clear() {
        this.cookieService.removeAll();
    }
}
