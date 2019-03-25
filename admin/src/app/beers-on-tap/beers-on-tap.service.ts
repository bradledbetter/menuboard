import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { BLModel, BLModelParam, BLModelService, extractParam } from './../shared/models';
import { BeerModel } from './beers-on-tap.model';

class Beer implements BeerModel {
  isNew = false;

  readonly dataType = 'beer';
  name = ''; // sort key
  abv: number;
  ibu: number;
  description: string;
  category: string;
  onTap = 0;
  private service: BeersOnTapService;

  constructor(service: BeersOnTapService, fields: any) {
    this.service = service;
    if (!fields.name || typeof fields.onTap !== 'number') {
      throw new Error('Could not create beer: required fields not provided');
    }
    this.updateFields(fields);
  }

  private updateFields(beer: Beer) {
    this.name = beer.name || '';
    this.abv = beer.abv;
    this.ibu = beer.ibu;
    this.description = beer.description;
    this.category = beer.category;
    this.onTap = beer.onTap || 0;
  }

  save(): Observable<BLModel> {
    if (this.isNew) {
      return this.service.create(this).pipe(
        tap((newBeer: Beer) => {
          this.isNew = false;
          this.updateFields(newBeer);
        }),
      );
    } else {
      return this.service.update(this).pipe(
        tap((updatedBeer: Beer) => {
          this.updateFields(updatedBeer);
        }),
      );
    }
  }

  delete(): Observable<any> {
    return this.service.delete(this).pipe(
      tap(() => {
        this.name = '';
        this.onTap = 0;
      }),
    );
  }
}

@Injectable()
export class BeersOnTapService implements BLModelService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  getNew(): BeerModel {
    return new Beer(this, {
      name: '',
      onTap: 0,
    });
  }

  load(params: BLModelParam[]): Observable<Beer> {
    const name = extractParam(params, 'name');
    if (!name) {
      throw new Error(`Could not get beer, name is empty: ${name}`);
    }
    return this.http.get(`${this.baseUrl}/${name}`).pipe(
      tap((result: BeerModel) => console.log('BeersOnTapService.load', result)),
      map((result: BeerModel) => new Beer(this, result)),
    );
  }

  loadList(params: BLModelParam[]): Observable<Beer[]> {
    return this.http.get(`${this.baseUrl}/tapped`).pipe(
      tap((result: BeerModel[]) => {
        console.log('BeersOnTapService.loadList', params, result);
      }),
      map((result: BeerModel[]) => result.map((beer: BeerModel) => new Beer(this, beer))),
    );
  }

  create(model: BeerModel): Observable<BeerModel> {
    return this.http.post(`${this.baseUrl}/`, model).pipe(
      tap((result: BeerModel) => {
        console.log('BeersOnTapService.create', model, result);
      }),
    );
  }

  update(model: BeerModel): Observable<BeerModel> {
    if (!model.name) {
      throw new Error(`Could not update beer, name is empty: ${model.name}`);
    }
    return this.http.put(`${this.baseUrl}/${model.name}`, model).pipe(
      tap((result: BeerModel) => {
        console.log('BeersOnTapService.update', model, result);
      }),
    );
  }

  delete(model: BeerModel): Observable<any> {
    if (!model.name) {
      throw new Error(`Could not delete beer, name is empty: ${model.name}`);
    }
    return this.http.delete(`${this.baseUrl}/${model.name}`).pipe(
      tap((result) => {
        console.log('BeersOnTapService.delete', model, result);
      }),
    );
  }
}
