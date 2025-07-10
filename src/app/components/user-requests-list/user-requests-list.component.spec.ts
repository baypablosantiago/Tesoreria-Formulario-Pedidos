import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestsListComponent } from './user-requests-list.component';

describe('UserRequestsListComponent', () => {
  let component: UserRequestsListComponent;
  let fixture: ComponentFixture<UserRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRequestsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
