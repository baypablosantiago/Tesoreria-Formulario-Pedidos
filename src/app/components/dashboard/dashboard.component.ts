import { Component, ViewChildren, QueryList, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { DaCardComponent } from "../da-card/da-card.component";
import { CommonModule } from '@angular/common';
import { FundingRequestAdminResponseDto } from '../../models';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MessageBoxService } from '../../services/message-box.service';
import { forkJoin, Subscription } from 'rxjs';
import { MatIconModule } from "@angular/material/icon";
import { SignalRService } from '../../services/signalr.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationDrawerComponent } from '../notification-drawer/notification-drawer.component';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [DaCardComponent, CommonModule, MatButtonModule, MatIconModule, NotificationDrawerComponent, MatMenuModule]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  constructor(
    private fundingService: FundingRequestService,
    private router: Router,
    private messageBox: MessageBoxService,
    private signalR: SignalRService,
    private notificationService: NotificationService) { }

  allRequests: FundingRequestAdminResponseDto[] = []
  private signalRSubscription?: Subscription;
  private signalRNotificationSubscription?: Subscription;
  private highlightSubscription?: Subscription;
  highlightedRequestId: number | null = null;

  sortBy: keyof FundingRequestAdminResponseDto = 'requestNumber';
  sortDirection: 'asc' | 'desc' = 'asc';
  isScrolled = false;

  sortFieldLabels: Record<string, string> = {
    'receivedAt': 'Fecha Recibido',
    'requestNumber': 'N° de Solicitud',
    'paymentOrderNumber': 'N° de Orden de Pago',
    'concept': 'Concepto',
    'dueDate': 'Vencimiento',
    'amount': 'Importe Solicitado',
    'fundingSource': 'Fuente de Financiamiento',
    'checkingAccount': 'Cuenta Corriente',
    'partialPayment': 'Pago Parcial'
  };

  get currentSortLabel(): string {
    return this.sortFieldLabels[this.sortBy] || 'N° de Solicitud';
  }

  @ViewChildren(DaCardComponent) daCards!: QueryList<DaCardComponent>;

  ngOnInit() {
    this.loadSortPreferences();

    this.fundingService.getAllActiveFundingRequests().subscribe(
      (requests) => {
        this.allRequests = requests;
        this.groupedRequests = this.groupByDA(requests);
      }
    );

    this.notificationService.loadNotificationsFromDB().subscribe(
      (dbNotifications) => {
        this.notificationService.initializeFromDB(dbNotifications);
      },
      (error) => {
        console.error('Error cargando notificaciones:', error);
      }
    );

    this.signalR.startConnection();

    this.signalRSubscription = this.signalR.fundingRequestChanged$.subscribe(
      (request) => {
        const index = this.allRequests.findIndex(r => r.id === request.id);

        if (request.isActive === false) {
          if (index !== -1) {
            this.allRequests.splice(index, 1);
            this.removeFromSelectionMap(request.id);
          }
        } else {
          if (index !== -1) {
            this.allRequests[index] = request;
          } else {
            this.allRequests.push(request);
          }
        }

        this.groupedRequests = this.groupByDA(this.allRequests);
      }
    );

    this.signalRNotificationSubscription = this.signalR.fundingRequestNotification$.subscribe(
      (notification) => {
        this.notificationService.addNotification(notification);
      }
    );

    this.highlightSubscription = this.notificationService.highlightRequest$.subscribe(
      (requestId: number) => {
        this.highlightRequest(requestId);
      }
    );
  }

  ngAfterViewInit() {
  }

  groupedRequests: { da: number; requests: FundingRequestAdminResponseDto[] }[] = [];

  private groupByDA(requests: FundingRequestAdminResponseDto[]) {
    const grouped: { [da: number]: FundingRequestAdminResponseDto[] } = {};

    for (const req of requests) {
      if (!grouped[req.da]) {
        grouped[req.da] = [];
      }
      grouped[req.da].push(req);
    }

    return Object.entries(grouped).map(([da, reqs]) => ({
      da: +da,
      requests: this.sortRequests(reqs)
    }));
  }

  setSortBy(field: keyof FundingRequestAdminResponseDto) {
    this.sortBy = field;
    this.saveSortPreferences();
    this.groupedRequests = this.groupByDA(this.allRequests);
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.saveSortPreferences();
    this.groupedRequests = this.groupByDA(this.allRequests);
  }

  private sortRequests(requests: FundingRequestAdminResponseDto[]): FundingRequestAdminResponseDto[] {
    return [...requests].sort((a, b) => {
      const aValue = a[this.sortBy];
      const bValue = b[this.sortBy];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return -1;
      if (bValue == null) return 1;

      let comparison = 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (this.sortBy === 'receivedAt') {
        const dateA = new Date(aValue as any);
        const dateB = new Date(bValue as any);
        comparison = dateA.getTime() - dateB.getTime();
      } else if (this.sortBy === 'dueDate') {
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          comparison = dateA.getTime() - dateB.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue), 'es-AR');
        }
      } else {
        comparison = String(aValue).localeCompare(String(bValue), 'es-AR');
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private saveSortPreferences() {
    localStorage.setItem('dashboardSortBy', this.sortBy);
    localStorage.setItem('dashboardSortDirection', this.sortDirection);
  }

  private loadSortPreferences() {
    const savedSortBy = localStorage.getItem('dashboardSortBy');
    const savedSortDirection = localStorage.getItem('dashboardSortDirection');

    if (savedSortBy) {
      this.sortBy = savedSortBy as keyof FundingRequestAdminResponseDto;
    }
    if (savedSortDirection === 'asc' || savedSortDirection === 'desc') {
      this.sortDirection = savedSortDirection;
    }
  }

  selectedRequestsMap = new Map<string, FundingRequestAdminResponseDto[]>();

  onSelectedRequestsChanged(daTitle: string, selected: FundingRequestAdminResponseDto[]) {
    this.selectedRequestsMap.set(daTitle, selected);
  }

  private removeFromSelectionMap(requestId: number): void {
    this.selectedRequestsMap.forEach((requests, key) => {
      const filtered = requests.filter(r => r.id !== requestId);
      if (filtered.length !== requests.length) {
        this.selectedRequestsMap.set(key, filtered);
      }
    });
  }

  changeIsActiveState() {
    const allSelected: FundingRequestAdminResponseDto[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas.', 'info', 'Atención');
      return;
    }

    this.messageBox.confirm(
      `¿Está seguro de marcar ${allSelected.length} solicitud${allSelected.length > 1 ? 'es' : ''} como finalizadas?`,
      'Confirmar cambio de estado'
    ).subscribe(confirmed => {
      if (confirmed) {
        const requests = allSelected.map(req =>
          this.fundingService.changeIsActive(req.id!)
        );

        forkJoin(requests).subscribe({
          next: updatedList => {
            this.messageBox.show('Las solicitudes seleccionadas fueron marcadas como finalizadas y ahora son visibles en la pestaña "Solicitudes finalizadas".', 'success', 'Exito');
            this.clearAllSelections();
          },
          error: err => {
            this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo ' + err, 'error');
          }
        });
      }
    });
  }


  copyToClipboard() {
    const allSelected: FundingRequestAdminResponseDto[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas para copiar.', 'info', 'Atención');
      return;
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2
      }).format(amount);
    };

    const headers = [
      'D.A.',
      'N° de Solicitud',
      'Ejercicio',
      'N° de Orden de Pago',
      'Concepto, Proveedor o Contratista',
      'Vencimiento',
      'Importe Solicitado',
      'Fuente de Financiamiento',
      'Cuenta Corriente a la cual acreditar'
    ];

    const groupedSelected: { [da: number]: FundingRequestAdminResponseDto[] } = {};
    allSelected.forEach(req => {
      if (!groupedSelected[req.da]) {
        groupedSelected[req.da] = [];
      }
      groupedSelected[req.da].push(req);
    });

    const sortedDAs = Object.keys(groupedSelected).map(Number).sort((a, b) => a - b);

    const tsvParts: string[] = [];

    sortedDAs.forEach((da, index) => {
      tsvParts.push(headers.join('\t'));
      const sortedRequests = this.sortRequests(groupedSelected[da]);

      const daRows = sortedRequests.map(req => [
        req.da,
        req.requestNumber,
        req.fiscalYear,
        req.paymentOrderNumber,
        req.concept,
        req.dueDate || '',
        formatCurrency(req.amount - req.partialPayment),
        req.fundingSource,
        req.checkingAccount
      ]);

      tsvParts.push(...daRows.map(row => row.join('\t')));

      if (index < sortedDAs.length - 1) {
        tsvParts.push('');
      }
    });

    const tsvContent = tsvParts.join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      this.messageBox.show('Datos copiados al portapapeles. Ahora podés pegarlos en Excel.', 'success');
    }).catch(err => {
      console.error('Error al copiar:', err);
      this.messageBox.show('No se pudo copiar al portapapeles.', 'error');
    });
  }

  getTotalAmount(requests: FundingRequestAdminResponseDto[]): number {
    return requests.reduce((sum, req) => sum + (req.amount - req.partialPayment), 0);
  }

  markSelectedAsOnWork() {
    const allSelected: FundingRequestAdminResponseDto[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas.', 'info', 'Atención');
      return;
    }

    this.messageBox.confirm(
      `¿Está seguro de marcar ${allSelected.length} solicitud${allSelected.length > 1 ? 'es' : ''} como "En revisión"?`,
      'Confirmar cambio de estado'
    ).subscribe(confirmed => {
      if (confirmed) {
        const requestIds = allSelected.map(req => req.id!);

        this.fundingService.markSelectedAsOnWork(requestIds).subscribe({
          next: (response) => {
            this.messageBox.show(`${response.updatedCount} solicitudes marcadas como "En revisión".`, 'success', 'Éxito');
            this.clearAllSelections();
          },
          error: err => {
            console.error('Error al marcar solicitudes como "En revisión":', err);
            this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo.', 'error');
          }
        });
      }
    });
  }

  markSelectedAsPending() {
    const allSelected: FundingRequestAdminResponseDto[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas.', 'info', 'Atención');
      return;
    }

    this.messageBox.confirm(
      `¿Está seguro de marcar ${allSelected.length} solicitud${allSelected.length > 1 ? 'es' : ''} como "Pendiente"?`,
      'Confirmar cambio de estado'
    ).subscribe(confirmed => {
      if (confirmed) {
        const requestIds = allSelected.map(req => req.id!);

        this.fundingService.markSelectedAsPending(requestIds).subscribe({
          next: (response) => {
            this.messageBox.show(`${response.updatedCount} solicitudes marcadas como "Pendiente".`, 'success', 'Éxito');
            this.clearAllSelections();
          },
          error: err => {
            console.error('Error al marcar solicitudes como "Pendiente":', err);
            this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo.', 'error');
          }
        });
      }
    });
  }

  selectAllRequests() {
    const allSelected = this.isAllRequestsSelected();
    this.daCards.forEach(card => {
      if (allSelected) {
        card.selection.clear();
      } else {
        card.requests.forEach(req => card.selection.select(req));
      }
      card.emitSelected();
    });
  }

  isAllRequestsSelected(): boolean {
    if (!this.daCards || this.daCards.length === 0) return false;
    return this.daCards.toArray().every(card => card.isAllSelected());
  }

  clearAllSelections() {
    this.selectedRequestsMap.clear();

    this.daCards.forEach(card => {
      card.selection.clear();
      card.emitSelected();
    });
  }

  highlightRequest(requestId: number): void {
    const request = this.allRequests.find(r => r.id === requestId);

    if (!request) {
      console.log('Solicitud no encontrada en el dashboard:', requestId);
      return;
    }

    this.highlightedRequestId = requestId;

    setTimeout(() => {
      const element = document.getElementById(`request-${requestId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      this.highlightedRequestId = null;
    }, 3000);
  }

  ngOnDestroy() {
    this.signalRSubscription?.unsubscribe();
    this.signalRNotificationSubscription?.unsubscribe();
    this.highlightSubscription?.unsubscribe();
    this.signalR.stopConnection();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  onFilterEnter() {
    this.messageBox.show('La funcion de filtro esta en desarrollo, ninguna base de datos fue eliminada :)', 'info', 'Base de datos eliminada');
  }

  markAllAsOnWork() {
    const totalRequests = this.allRequests.length;

    if (totalRequests === 0) {
      this.messageBox.show('No hay solicitudes activas para marcar', 'info', 'Atención');
      return;
    }

    const requestIds = this.allRequests.map(r => r.id);

    this.messageBox.confirm(
      `¿Está seguro de marcar las ${totalRequests} solicitudes como "En revisión"?`,
      'Confirmar acción masiva'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.fundingService.setOnWorkBatch(requestIds, true).subscribe({
          next: (response) => {
            this.messageBox.show(
              `${response.updatedCount} solicitudes marcadas como "En revisión" correctamente`,
              'success',
              'Éxito'
            );
          },
          error: (err) => {
            console.error('Error al marcar solicitudes:', err);
            this.messageBox.show(
              'Ocurrió un error al marcar las solicitudes. Informe a desarrollo.',
              'error',
              'Error'
            );
          }
        });
      }
    });
  }

}