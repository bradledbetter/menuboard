import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js';
import * as STS from 'aws-sdk/clients/sts';
import * as AWS from 'aws-sdk/global';
import { CognitoCallback, CognitoService, LoggedInCallback } from './congito.service';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(public cognito: CognitoService) {}

  private onLoginSuccess = (callback: CognitoCallback, session: CognitoUserSession) => {
    console.log('In authenticateUser onSuccess callback');

    AWS.config.credentials = this.cognito.buildCognitoCreds(session.getIdToken().getJwtToken());

    // When CognitoIdentity authenticates a user, it doesn't actually hand us the IdentityID,
    // used by many of our other handlers. This is handled by some sly underhanded calls to AWS Cognito
    // API's by the SDK itself, automatically when the first AWS SDK request is made that requires our
    // security credentials. The identity is then injected directly into the credentials object.
    // If the first SDK call we make wants to use our IdentityID, we have a
    // chicken and egg problem on our hands. We resolve this problem by "priming" the AWS SDK by calling a
    // very innocuous API call that forces this behavior.
    const clientParams: any = {};
    const sts = new STS(clientParams);
    sts.getCallerIdentity((err, data) => {
      console.log('UserLoginService: Successfully set the AWS credentials');
      callback.cognitoCallback(null, session);
    });
  }

  private onLoginError = (callback: CognitoCallback, err) => {
    callback.cognitoCallback(err.message, null);
  }

  authenticate(username: string, password: string, callback: CognitoCallback) {
    console.log('UserLoginService: starting the authentication');

    const authenticationData = {
      Username: username,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    console.log('UserLoginService: Params set...Authenticating the user');
    const cognitoUser = new CognitoUser(userData);
    console.log('UserLoginService: config is ' + AWS.config);
    cognitoUser.authenticateUser(authenticationDetails, {
      newPasswordRequired: (userAttributes, requiredAttributes) => callback.cognitoCallback(`User needs to set password.`, null),
      onSuccess: (result) => this.onLoginSuccess(callback, result),
      onFailure: (err) => this.onLoginError(callback, err),
      mfaRequired: (challengeName, challengeParameters) => {
        callback.handleMFAStep(challengeName, challengeParameters, (confirmationCode: string) => {
          cognitoUser.sendMFACode(confirmationCode, {
            onSuccess: (result) => this.onLoginSuccess(callback, result),
            onFailure: (err) => this.onLoginError(callback, err),
          });
        });
      },
    });
  }

  forgotPassword(username: string, callback: CognitoCallback) {
    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess() {},
      onFailure(err) {
        callback.cognitoCallback(err.message, null);
      },
      inputVerificationCode() {
        callback.cognitoCallback(null, null);
      },
    });
  }

  confirmNewPassword(email: string, verificationCode: string, password: string, callback: CognitoCallback) {
    const userData = {
      Username: email,
      Pool: this.cognito.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess() {
        callback.cognitoCallback(null, null);
      },
      onFailure(err) {
        callback.cognitoCallback(err.message, null);
      },
    });
  }

  logout() {
    console.log('UserLoginService: Logging out');
    this.cognito.getCurrentUser().signOut();
  }

  isAuthenticated(callback: LoggedInCallback) {
    debugger;
    if (callback == null) {
      throw new Error('UserLoginService: Callback in isAuthenticated() cannot be null');
    }

    const cognitoUser = this.cognito.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.log('UserLoginService: Couldn\'t get the session: ' + err, err.stack);
          callback(err, false);
        } else {
          console.log('UserLoginService: Session is ' + session.isValid());
          callback(err, session.isValid());
        }
      });
    } else {
      console.log('UserLoginService: can\'t retrieve the current user');
      callback('Can\'t retrieve the CurrentUser', false);
    }
  }

  register(user: User, callback: CognitoCallback): void {
    console.log('UserRegistrationService: user is ' + user);

    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: user.email,
      }),
    ];

    this.cognito.userPool.signUp(user.email, user.password, attributeList, null, (err, result) => {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        console.log('UserRegistrationService: registered user is ' + result);
        callback.cognitoCallback(null, result);
      }
    });
  }

  confirmRegistration(username: string, confirmationCode: string, callback: CognitoCallback): void {
    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        callback.cognitoCallback(null, result);
      }
    });
  }

  resendCode(username: string, callback: CognitoCallback): void {
    const userData = {
      Username: username,
      Pool: this.cognito.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        callback.cognitoCallback(null, result);
      }
    });
  }

  newPassword(newPasswordUser: User, newPassword: string, callback: CognitoCallback): void {
    console.log(newPasswordUser);
    // Get these details and call cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
    const authenticationData = {
      Username: newPasswordUser.email,
      Password: newPasswordUser.password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: newPasswordUser.email,
      Pool: this.cognito.userPool,
    };

    console.log('UserLoginService: Params set...Authenticating the user');
    const cognitoUser = new CognitoUser(userData);
    console.log('UserLoginService: config is ' + AWS.config);
    cognitoUser.authenticateUser(authenticationDetails, {
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;
        cognitoUser.completeNewPasswordChallenge(newPassword, requiredAttributes, {
          onSuccess: (result) => {
            callback.cognitoCallback(null, userAttributes);
          },
          onFailure: (err) => {
            callback.cognitoCallback(err, null);
          },
        });
      },
      onSuccess: (result) => {
        callback.cognitoCallback(null, result);
      },
      onFailure: (err) => {
        callback.cognitoCallback(err, null);
      },
    });
  }
}
