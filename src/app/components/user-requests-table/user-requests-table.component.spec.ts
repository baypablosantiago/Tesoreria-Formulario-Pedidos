import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestsTableComponent } from './user-requests-table.component';

describe('UserRequestsTableComponent', () => {
  let component: UserRequestsTableComponent;
  let fixture: ComponentFixture<UserRequestsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRequestsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRequestsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
