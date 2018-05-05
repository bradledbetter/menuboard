import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/finally';
import 'rxjs/add/observable/of';
import { AuthService } from './../auth/auth.service';

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
        // private zone: NgZone,// not needed
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private cookie: CookieService,
        private auth: AuthService) { }

    ngOnInit() {
        console.log('LoginComponent:ngOnInit');
        this.email = this.formBuilder.control('brad@thirstynomadbrewing.com', [Validators.required, Validators.email]);
        this.password = this.formBuilder.control('ThirstyNomad1', [Validators.required, Validators.minLength(this.passwordMinLength)]);
        // TODO: password format custom validator
    }

    /**
     * Handle login button click by logging in
     */
    login() {
        // added info route as post and had it pass set-cookie header, and this causes the weird behavior
        // doesn't matter if auth is used on server
        // event.preventDefault and stopPropagation don't matter
        // type=button|submit doesn't matter
        // query string on login page doesn't matter
        // navigate in subscribe first function or complete doesn't matter
        // the name of the cookie DOES matter. It breaks when the name is session
        // the cookie does have to have a value, though
        console.log('login() function');
        // TODO:
        this.auth
            .login(this.email.value, this.password.value)
            .subscribe(() => {
                console.log(`session cookie: `, this.cookie.get('session'));
                this.router.navigate([this.route.snapshot.queryParams['returnUrl'] || '/']);
                console.log('login - redirect');
                this.router.navigate(['/register']);
            });
    }

}
