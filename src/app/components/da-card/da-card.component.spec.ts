import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaCardComponent } from './da-card.component';

describe('DaCardComponent', () => {
  let component: DaCardComponent;
  let fixture: ComponentFixture<DaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
