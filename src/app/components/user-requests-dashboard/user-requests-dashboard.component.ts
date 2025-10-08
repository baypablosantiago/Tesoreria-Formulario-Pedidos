import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { UserRequestsListComponent } from '../user-requests-list/user-requests-list.component';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequestResponseDto } from '../../models';
import { UserNotificationService } from '../../services/user-notification.service';
import { PollingService } from '../../services/polling.service';

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
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  myRequests: FundingRequestResponseDto[] = [];
  activeAndPartialRequests: FundingRequestResponseDto[] = [];
  inactiveRequests: FundingRequestResponseDto[] = [];
  highlightedRequestId: number | null = null;

  private pollingSubscription?: any;
  private navigationSubscription?: any;

  constructor(
    private fundingRequestService: FundingRequestService,
    private userNotificationService: UserNotificationService,
    private pollingService: PollingService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadNotifications();

    this.pollingSubscription = this.pollingService.tick$.subscribe(() => {
      this.loadRequests();
      this.loadNotifications();
    });


    this.navigationSubscription = this.userNotificationService.pendingNavigation$.subscribe(pending => {
      if (pending) {
       
        setTimeout(() => {
          this.selectTabAndHighlight(pending.requestId, pending.changeType);
          this.userNotificationService.pendingNavigation$.next(null);
        }, 500);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
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

  private loadNotifications(): void {
    this.userNotificationService.loadNotificationsFromDB().subscribe({
      next: (dbNotifications) => {
        this.userNotificationService.initializeFromDB(dbNotifications);
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
      }
    });
  }

  private selectTabAndHighlight(requestId: number, changeType: string): void {
    const tabIndex = changeType === 'STATUS_FINALIZED' ? 1 : 0;

    if (this.tabGroup) {
      this.tabGroup.selectedIndex = tabIndex;
    }

    setTimeout(() => {
      this.highlightRequest(requestId);
    }, 200);
  }

  private highlightRequest(requestId: number): void {
    this.highlightedRequestId = requestId;

    setTimeout(() => {
      const element = document.getElementById(`request-${requestId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      this.highlightedRequestId = null;
    }, 5000);
  }
}
