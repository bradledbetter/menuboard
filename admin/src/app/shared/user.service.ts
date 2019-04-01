import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { environment } from 'src/environments/environment';
import { CognitoMFACallback, CognitoService } from './congito.service';

export enum AuthCode {
  Authenticated = 1,
  PasswordChangeRequired,
  AccountResetRequired,
  AuthenticationFailure,
}

export interface AuthResult {
  code: AuthCode;
  message: string;
  session?: CognitoUserSession;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(public cognito: CognitoService) {}

  private onLoginSuccess(session: CognitoUserSession): Promise<AuthResult> {
    console.log('In authenticateUser onSuccess callback');

    return new Promise((resolve, reject) => {
      AWS.config.region = environment.region;
      AWS.config.credentials = this.cognito.buildCognitoCreds(session.getIdToken().getJwtToken());

      // When CognitoIdentity authenticates a user, it doesn't actually hand us the IdentityID,
      // used by many of our other handlers. This is handled by some sly underhanded calls to AWS Cognito
      // API's by the SDK itself, automatically when the first AWS SDK request is made that requires our
      // security credentials. The identity is then injected directly into the credentials object.
      // If the first SDK call we make wants to use our IdentityID, we have a
      // chicken and egg problem on our hands. We resolve this problem by "priming" the AWS SDK by calling a
      // very innocuous API call that forces this behavior.
      const clientParams: any = {};
      const sts = new AWS.STS(clientParams);
      sts.getCallerIdentity((err, data) => {
        if (err) {
          reject({ code: AuthCode.AuthenticationFailure, message: err.message, session: null });
        } else {
          console.log('UserLoginService: Successfully set the AWS credentials', data);
          resolve({ code: AuthCode.Authenticated, message: `Login successful`, session });
        }
      });
    });
  }

  authenticate(username: string, password: string, handleMFAStep?: CognitoMFACallback): Promise<AuthResult> {
    console.log('UserService.authenticate: starting the authentication');
    const authenticationData = {
      Username: username,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    return new Promise((resolve, reject) => {
      console.log('UserService.authenticate: Params set...Authenticating the user');
      const cognitoUser = new CognitoUser(userData);
      console.log('UserService.authenticate: config is ', AWS.config);
      cognitoUser.authenticateUser(authenticationDetails, {
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log('UserService.authenticate: newPasswordRequired userAttributes', userAttributes);
          console.log('UserService.authenticate: newPasswordRequired requiredAttributes', requiredAttributes);
          reject({ code: AuthCode.PasswordChangeRequired, message: `User needs to set a new password.` });
        },
        onSuccess: (session) => {
          this.onLoginSuccess(session)
            .then(resolve)
            .catch(reject);
        },
        onFailure: (err) => {
          reject({ code: AuthCode.AuthenticationFailure, message: `Login failure: ${err.message}.` });
        },
        mfaRequired: (challengeName, challengeParameters) => {
          if (handleMFAStep) {
            handleMFAStep(challengeName, challengeParameters, (confirmationCode: string) => {
              cognitoUser.sendMFACode(confirmationCode, {
                onSuccess: (session) => {
                  this.onLoginSuccess(session)
                    .then(resolve)
                    .catch(reject);
                },
                onFailure: (err) => {
                  reject({ code: AuthCode.AuthenticationFailure, message: `Login failure: ${err.message}.` });
                },
              });
            });
          } else {
            reject({ code: AuthCode.AuthenticationFailure, message: `Login failure: MFA was requested, but no callback provided` });
          }
        },
      });
    });
  }

  forgotPassword(username: string): Promise<any> {
    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.forgotPassword({
        onSuccess() {
          resolve(true);
        },
        onFailure(err) {
          reject(err);
        },
        // A code may be required to confirm and complete the password reset process Supply the new password and the confirmation code
        // which was sent through email/sms to the continuation
        inputVerificationCode() {
          reject(new Error('UserService: need to implement verification code password reset.'));
        },
      });
    });
  }

  confirmNewPassword(email: string, verificationCode: string, password: string): Promise<any> {
    const userData = {
      Username: email,
      Pool: this.cognito.userPool,
    };

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmPassword(verificationCode, password, {
        onSuccess() {
          resolve(true);
        },
        onFailure(err) {
          reject(err);
        },
      });
    });
  }

  logout() {
    console.log('UserLoginService: Logging out');
    this.cognito.getCurrentUser().signOut();
  }

  isAuthenticated(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.cognito.getCurrentUser();

      if (cognitoUser != null) {
        cognitoUser.getSession((error, session) => {
          if (error) {
            console.log(`UserService.isAuthenticated: Couldn't get the session: `, error);
            reject(error);
          } else {
            if (session.isValid()) {
              resolve(session);
            } else {
              console.log(`UserService.isAuthenticated: Got the user, but the session is invalid`);
              reject(error);
            }
          }
        });
      } else {
        reject(new Error(`UserService.isAuthenticated: Can't retrieve the CurrentUser`));
      }
    });
  }

  register(email: string, password: string): Promise<any> {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];
    return new Promise((resolve, reject) => {
      this.cognito.userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log('UserService.register: registered user is ' + result);
          resolve(result);
        }
      });
    });
  }

  confirmRegistration(username: string, confirmationCode: string): Promise<any> {
    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  resendCode(username: string): Promise<any> {
    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  newPassword(email: string, password: string, newPassword: string): Promise<any> {
    // Get these details and call cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: this.cognito.userPool,
    };
    console.log('UserService.newPassword: Params set...Authenticating the user');

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser(userData);
      console.log('UserService.newPassword: config is ', AWS.config);
      cognitoUser.authenticateUser(authenticationDetails, {
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.

          // the api doesn't accept this field back
          delete userAttributes.email_verified;
          cognitoUser.completeNewPasswordChallenge(newPassword, requiredAttributes, {
            onSuccess: (result) => {
              console.log('UserService.newPassword: success', result);
              resolve(userAttributes);
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        },
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
}
