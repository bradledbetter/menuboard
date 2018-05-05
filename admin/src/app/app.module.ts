import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule
} from '@angular/material';

import { CookieModule } from 'ngx-cookie';

import { APP_INITIALIZER_PROVIDER } from './app.initializer';
import { appRoutes } from './app.routes';

import { AppComponent } from './app.component';
import { UploaderComponent } from './uploader/uploader.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';

import { AuthGuard, AuthService } from './auth';
import { ConfigService } from './config/config.service';
import { SessionService } from './session/session.service';
import { LoginInterceptor } from './login/login.interceptor';

@NgModule({
    declarations: [
        AppComponent,
        UploaderComponent,
        LoginComponent,
        RegisterComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        ReactiveFormsModule,
        CookieModule.forRoot(),
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTooltipModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule
    ],
    providers: [
        APP_INITIALIZER_PROVIDER,
        ConfigService,
        SessionService,
        AuthGuard,
        AuthService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
