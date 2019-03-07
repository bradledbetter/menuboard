import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeersOnTapComponent } from './beers-on-tap.component';

describe('BeersOnTapComponent', () => {
  let component: BeersOnTapComponent;
  let fixture: ComponentFixture<BeersOnTapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeersOnTapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeersOnTapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
