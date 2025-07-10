import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { UserRequestsListComponent } from '../user-requests-list/user-requests-list.component';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequest } from '../../models/funding-request';

@Component({
  selector: 'app-user-requests-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    UserRequestsListComponent
  ],
  templateUrl: './user-requests-dashboard.component.html',
  styleUrls: ['./user-requests-dashboard.component.scss']
})
export class UserRequestsDashboardComponent implements OnInit {
  myRequests: FundingRequest[] = [];
  activeAndPartialRequests: FundingRequest[] = [];
  inactiveRequests: FundingRequest[] = [];

  constructor(private fundingRequestService: FundingRequestService) {}

  ngOnInit(): void {
    this.fundingRequestService.getMyFundingRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.activeAndPartialRequests = this.myRequests.filter(r => r.isActive);
        this.inactiveRequests = this.myRequests.filter(r => !r.isActive);
      }
    });
  }
}
