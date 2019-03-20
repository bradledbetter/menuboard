import { Observable } from 'rxjs';

/**
 * Defines key type(s) as well as (optionally) values. Used both for defining keys in models and for passing parametes to model functions.
 * Some model stores (e.g. DynamoDB) may require multiple values to uniquely identify a model instance. Others (e.g. most SQL db's) have a
 * single key (e.g. 'id') that identifies a row in a table. Depending on an API implementation, we may need to pass one or more keys to a
 * We're assuming it can be useful to define the key schema for a model in a generic
 */
export interface BLModelParam {
  name: string; // e.g. 'dataType'
  type: string; // e.g. 'HASH' (maybe should be enum)
  value?: string; // e.g. 'beer'
}

/**
 * Shared model interface. Any model interface should extend this.
 */
export interface BLModel {
  /**
   * If true, the model hasn't been persisted to the API
   */
  isNew: boolean;

  /**
   * Save this new or not new (already persisted to API) model to the API.
   */
  save: () => Observable<BLModel>;

  /**
   * Delete this model on the API.
   */
  delete: () => Observable<any>;
}

/**
 * Serves as both the interface between front end to retrieve, persist, and delete models on an API as well as a model factory to generate
 * new instances that have not yet been saved to a backend.
 */
export interface BLModelService {
  /**
   * Get a new (not persisted) instance of a model
   */
  getNew: () => BLModel;

  /**
   * Load one instance of a model from the API. e.g. GET url/:id
   */
  load: (params: BLModelParam[]) => Observable<BLModel>;

  /**
   * Load a list of model instances from the API. e.g. GET url/
   */
  loadList: (params?: BLModelParam[]) => Observable<BLModel[]>;

  /**
   * Persist new model to the API. e.g. POST url/:id
   */
  create: (model: BLModel) => Observable<BLModel>;

  /**
   * Update an existing model to the API. e.g. PUT url/:id
   */
  update: (model: BLModel) => Observable<BLModel>;

  /**
   * Delete an existing model on the API. e.g. DELETE url/:id
   */
  delete: (model: BLModel) => Observable<any>;
}

export function extractParam(params: BLModelParam[], name: string): any {
  const foundKey = params.find((key) => key.name === name);
  return foundKey ? foundKey.value : undefined;
}
