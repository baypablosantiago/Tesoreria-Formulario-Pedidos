import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { UserRequestsListComponent } from '../user-requests-list/user-requests-list.component';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequestResponseDto } from '../../models';

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
export class UserRequestsDashboardComponent implements OnInit, OnDestroy {
  myRequests: FundingRequestResponseDto[] = [];
  activeAndPartialRequests: FundingRequestResponseDto[] = [];
  inactiveRequests: FundingRequestResponseDto[] = [];
  private pollingInterval?: any;

  constructor(private fundingRequestService: FundingRequestService) {}

  ngOnInit(): void {
    this.loadRequests();

    this.pollingInterval = setInterval(() => {
      this.loadRequests();
    }, 180000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private loadRequests(): void {
    this.fundingRequestService.getMyFundingRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.activeAndPartialRequests = this.myRequests.filter(r => r.isActive);
        this.inactiveRequests = this.myRequests.filter(r => !r.isActive);
      }
    });
  }
}
