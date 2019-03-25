import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { EmailVerifyTokenComponent } from './email-verify-token.component';

describe('EmailVerifyTokenComponent', () => {
  let component: EmailVerifyTokenComponent;
  let fixture: ComponentFixture<EmailVerifyTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmailVerifyTokenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailVerifyTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
