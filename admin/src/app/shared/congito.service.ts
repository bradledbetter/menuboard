import { Injectable } from '@angular/core';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import * as AWS from 'aws-sdk/global';
import * as awsservice from 'aws-sdk/lib/service';
import { environment } from '../../environments/environment';

/**
 * Stolen from Vladimir Budilov
 */
export interface CognitoCallback {
  cognitoCallback(message: string, result: any): void;

  handleMFAStep?(challengeName: string, challengeParameters: ChallengeParameters, callback: (confirmationCode: string) => any): void;
}

export type LoggedInCallback  = (message: string, loggedIn: boolean) => void;

export interface ChallengeParameters {
  CODE_DELIVERY_DELIVERY_MEDIUM: string;

  CODE_DELIVERY_DESTINATION: string;
}

export interface Callback {
  callback(): void;

  callbackWithParam(result: any): void;
}

@Injectable({ providedIn: 'root' })
export class CognitoService {
  private cognitoCreds: AWS.CognitoIdentityCredentials;
  private _userPool: CognitoUserPool;

  constructor() {
    // this._userPool = new CognitoUserPool({
    //   UserPoolId: environment.userPoolId,
    //   ClientId: environment.clientId,
    // });
  }

  get userPool(): CognitoUserPool {
    return this._userPool;
  }

  getCurrentUser() {
    return this._userPool.getCurrentUser();
  }

  // AWS Stores Credentials in many ways, and with TypeScript this means that
  // getting the base credentials we authenticated with from the AWS globals gets really murky,
  // having to get around both class extension and unions. Therefore, we're going to give
  // developers direct access to the raw, unadulterated CognitoIdentityCredentials
  // object at all times.
  setCognitoCreds(creds: AWS.CognitoIdentityCredentials) {
    this.cognitoCreds = creds;
  }

  getCognitoCreds() {
    return this.cognitoCreds;
  }

  // This method takes in a raw jwtToken and uses the global AWS config options to build a
  // CognitoIdentityCredentials object and store it for us. It also returns the object to the caller
  // to avoid unnecessary calls to setCognitoCreds.
  buildCognitoCreds(idTokenJwt: string) {
    // todo: do I need this? I think not if I'm not using an identity provider
    const url = 'cognito-idp.' + environment.region.toLowerCase() + '.amazonaws.com/' + environment.userPoolId;
    const logins: CognitoIdentity.LoginsMap = {};
    logins[url] = idTokenJwt;
    const params = {
      Logins: logins,
      IdentityPoolId: environment.identityPoolId,
    };
    const serviceConfigs = {} as awsservice.ServiceConfigurationOptions;
    const creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
    this.setCognitoCreds(creds);
    return creds;
  }

  getCognitoIdentity(): string {
    return this.cognitoCreds.identityId;
  }

  getAccessToken(callback: Callback): void {
    if (callback == null) {
      throw new Error('CognitoService: callback in getAccessToken is null...returning');
    }
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession((err, session) => {
        if (err) {
          console.log(`CognitoService: Can't set the credentials:`, err);
          callback.callbackWithParam(null);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getAccessToken().getJwtToken());
          }
        }
      });
    } else {
      callback.callbackWithParam(null);
    }
  }

  getIdToken(callback: Callback): void {
    if (callback == null) {
      throw new Error('CognitoService: callback in getIdToken is null...returning');
    }
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession((err, session) => {
        if (err) {
          console.log(`CognitoService: Can't set the credentials: `, err);
          callback.callbackWithParam(null);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getIdToken().getJwtToken());
          } else {
            console.log(`CognitoService: Got the id token, but the session isn't valid`);
          }
        }
      });
    } else {
      callback.callbackWithParam(null);
    }
  }

  getRefreshToken(callback: Callback): void {
    if (callback == null) {
      throw new Error('CognitoService: callback in getRefreshToken is null...returning');
    }
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession((err, session) => {
        if (err) {
          console.log(`CognitoService: Can't set the credentials: `, err);
          callback.callbackWithParam(null);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getRefreshToken());
          }
        }
      });
    } else {
      callback.callbackWithParam(null);
    }
  }

  refresh(): void {
    this.getCurrentUser().getSession((err, session) => {
      if (err) {
        console.log(`CognitoService: Can't set the credentials: `, err);
      } else {
        if (session.isValid()) {
          console.log('CognitoService: refreshed successfully');
        } else {
          console.log('CognitoService: refreshed but session is still not valid');
        }
      }
    });
  }
}
