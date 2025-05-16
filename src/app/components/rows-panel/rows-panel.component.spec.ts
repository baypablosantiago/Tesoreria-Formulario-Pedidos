import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowsPanelComponent } from './rows-panel.component';

describe('RowsPanelComponent', () => {
  let component: RowsPanelComponent;
  let fixture: ComponentFixture<RowsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
