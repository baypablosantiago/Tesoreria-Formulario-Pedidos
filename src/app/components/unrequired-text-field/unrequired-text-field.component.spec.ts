import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnrequiredTextFieldComponent } from './unrequired-text-field.component';

describe('UnrequiredTextFieldComponent', () => {
  let component: UnrequiredTextFieldComponent;
  let fixture: ComponentFixture<UnrequiredTextFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnrequiredTextFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnrequiredTextFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
