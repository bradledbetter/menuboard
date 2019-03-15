import { TestBed } from '@angular/core/testing';

import { BeersOnTapService } from './beers-on-tap.service';

describe('BeersOnTapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BeersOnTapService = TestBed.get(BeersOnTapService);
    expect(service).toBeTruthy();
  });
});
