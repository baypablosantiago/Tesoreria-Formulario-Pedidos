import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRowButtonComponent } from './add-row-button.component';

describe('AddRowButtonComponent', () => {
  let component: AddRowButtonComponent;
  let fixture: ComponentFixture<AddRowButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRowButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRowButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
