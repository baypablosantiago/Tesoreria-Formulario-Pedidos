import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveRowButtonComponent } from './remove-row-button.component';

describe('RemoveRowButtonComponent', () => {
  let component: RemoveRowButtonComponent;
  let fixture: ComponentFixture<RemoveRowButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveRowButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveRowButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
