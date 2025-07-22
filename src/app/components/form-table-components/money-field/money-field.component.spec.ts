import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyFieldComponent } from './money-field.component';

describe('MoneyFieldComponent', () => {
  let component: MoneyFieldComponent;
  let fixture: ComponentFixture<MoneyFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoneyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
