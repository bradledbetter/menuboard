import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  private config = {};

  constructor() { }

  /**
   * Init the internal config state
   * @param config the config to start with
   */
  init(config: any) {
    this.config = Object.assign({}, this.config, config);
  }

  /**
   * Get the value of a config key
   * @param key the key to look up
   */
  get(key: string): any {
    return this.config[key];
  }

  /**
   * Set a configuration value
   * @param key the key to set
   * @param value the value to set it to
   */
  set(key: string, value: any) {
    this.config = Object.assign({}, this.config, { [key]: value });
  }
}
