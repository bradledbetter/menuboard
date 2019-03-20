import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
  private baseUrl = 'https://dev.api-menuviz.net/beers-on-tap';

  constructor(private http: HttpClient) {}

  getNew(): BeerModel {
    return new Beer(this, {
      name: '',
      onTap: 0,
    });
  }

  load(params: BLModelParam[]): Observable<BeerModel> {
    const name = extractParam(params, 'name');
    if (!name) {
      throw new Error(`Could not get beer, name is empty: ${name}`);
    }
    return this.http.get(`${this.baseUrl}/${name}`).pipe(
      tap((result) => console.log('BeersOnTapService.load', result)),
      map((result) => (result as any) as BeerModel), // to avoid type complaints
    );
  }

  loadList(params: BLModelParam[]): Observable<BeerModel[]> {
    return this.http.get(`${this.baseUrl}/tapped`).pipe(
      tap((result) => {
        console.log('BeersOnTapService.loadList', params, result);
      }),
      map((result) => (result as any) as BeerModel[]), // avoiding type complaints
    );
  }

  create(model: BeerModel): Observable<BeerModel> {
    return this.http.post(`${this.baseUrl}/`, model).pipe(
      tap((result) => {
        console.log('BeersOnTapService.create', model, result);
      }),
      map((result) => (result as any) as BeerModel), // avoiding type complaints
    );
  }

  update(model: BeerModel): Observable<BeerModel> {
    if (!model.name) {
      throw new Error(`Could not update beer, name is empty: ${model.name}`);
    }
    return this.http.put(`${this.baseUrl}/${model.name}`, model).pipe(
      tap((result) => {
        console.log('BeersOnTapService.update', model, result);
      }),
      map((result) => (result as any) as BeerModel), // avoiding type complaints
    );
  }

  delete(model: BeerModel): Observable<BeerModel> {
    if (!model.name) {
      throw new Error(`Could not delete beer, name is empty: ${model.name}`);
    }
    return this.http.delete(`${this.baseUrl}/${model.name}`).pipe(
      tap((result) => {
        console.log('BeersOnTapService.delete', model, result);
      }),
      map((result) => (result as any) as BeerModel), // avoiding type complaints
    );
  }
}
