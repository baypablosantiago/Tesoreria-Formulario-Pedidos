import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestsDashboardComponent } from './user-requests-dashboard.component';

describe('UserRequestsDashboardComponent', () => {
  let component: UserRequestsDashboardComponent;
  let fixture: ComponentFixture<UserRequestsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRequestsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRequestsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
