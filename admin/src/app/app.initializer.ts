import { APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './config/config.service';

export function appInitializerFactory(
    config: ConfigService) {

    return () => {
        // TODO: load from a file
        config.init({
            api: 'http://localhost:7531'
        });
    };
}

export const APP_INITIALIZER_PROVIDER = {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [ConfigService],
    multi: true
};
