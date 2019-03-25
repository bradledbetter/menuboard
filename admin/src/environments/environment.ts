// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  api: 'http://localhost:3000/',

  region: 'us-east-1',
  identityPoolId: 'us-east-1:c778082c-7a81-41f6-a920-188c422ffd9c',
  userPoolId: 'us-east-1_enpgiRkQG',
  clientId: 's4cod8ov1ccrbvcatlcivc3m8',

  passwords: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChars: true,
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
