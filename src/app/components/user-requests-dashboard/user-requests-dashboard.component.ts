import { Component, OnInit, OnDestroy, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { UserRequestsListComponent } from '../user-requests-list/user-requests-list.component';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequestResponseDto, UserMonthGroup } from '../../models';
import { UserNotificationService } from '../../services/user-notification.service';
import { PollingService } from '../../services/polling.service';

@Component({
  selector: 'app-user-requests-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    UserRequestsListComponent
  ],
  templateUrl: './user-requests-dashboard.component.html',
  styleUrls: ['./user-requests-dashboard.component.scss']
})
export class UserRequestsDashboardComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  @ViewChildren(MatExpansionPanel) expansionPanels!: QueryList<MatExpansionPanel>;

  myRequests: FundingRequestResponseDto[] = [];
  activeAndPartialRequests: FundingRequestResponseDto[] = [];
  inactiveRequests: FundingRequestResponseDto[] = [];
  groupedInactiveRequests: UserMonthGroup[] = [];
  highlightedRequestId: number | null = null;
  openPanels = new Set<string>();

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
        this.groupInactiveRequestsByMonth();
      }
    });
  }

  private groupInactiveRequestsByMonth(): void {
    const grouped: { [month: string]: FundingRequestResponseDto[] } = {};

    for (const req of this.inactiveRequests) {
      const date = new Date(req.receivedAt!);
      const monthKey = this.formatYearMonth(date);

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(req);
    }

    this.groupedInactiveRequests = Object.entries(grouped)
      .map(([month, requests]) => ({
        month,
        requests,
        count: requests.length
      }))
      .sort((a, b) => {
        // Ordenar por fecha más reciente primero
        const dateA = new Date(a.requests[0].receivedAt!);
        const dateB = new Date(b.requests[0].receivedAt!);
        return dateB.getTime() - dateA.getTime();
      });
  }

  private formatYearMonth(date: Date): string {
    const month = date.toLocaleString('es-AR', { month: 'long' });
    const year = date.getFullYear();
    return `${year} - ${this.capitalize(month)}`;
  }

  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
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

    // Verificar si la solicitud está en las solicitudes inactivas (dentro de acordeones)
    const monthGroupIndex = this.findMonthGroupIndexByRequestId(requestId);

    if (monthGroupIndex !== -1) {
      // La solicitud está en un acordeón, expandirlo primero
      this.expandPanelAndScroll(monthGroupIndex, requestId);
    } else {
      // La solicitud está en solicitudes activas, hacer scroll directamente
      this.scrollToRequest(requestId);
    }

    setTimeout(() => {
      this.highlightedRequestId = null;
    }, 5000);
  }

  private findMonthGroupIndexByRequestId(requestId: number): number {
    return this.groupedInactiveRequests.findIndex(group =>
      group.requests.some(req => req.id === requestId)
    );
  }

  private expandPanelAndScroll(panelIndex: number, requestId: number): void {
    const monthGroup = this.groupedInactiveRequests[panelIndex];
    if (monthGroup) {
      // Agregar al set de paneles abiertos
      this.openPanels.add(monthGroup.month);

      // Esperar a que el panel se expanda completamente antes de hacer scroll
      setTimeout(() => {
        this.scrollToRequest(requestId);
      }, 400);
    }
  }

  private scrollToRequest(requestId: number): void {
    const element = document.getElementById(`request-${requestId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  trackByMonth(index: number, item: UserMonthGroup): string {
    return item.month;
  }

  isPanelOpen(month: string): boolean {
    return this.openPanels.has(month);
  }

  onPanelOpened(month: string): void {
    this.openPanels.add(month);
  }

  onPanelClosed(month: string): void {
    this.openPanels.delete(month);
  }
}
