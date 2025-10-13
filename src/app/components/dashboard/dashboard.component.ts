import { Component, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
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


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [DaCardComponent, CommonModule, MatButtonModule, MatIconModule, NotificationDrawerComponent]
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

  @ViewChildren(DaCardComponent) daCards!: QueryList<DaCardComponent>;

  ngOnInit() {
    this.fundingService.getAllActiveFundingRequests().subscribe(
      (requests) => {
        this.allRequests = requests;
        this.groupedRequests = this.groupByDA(requests);
      }
    );

    // Cargar notificaciones desde la base de datos
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

        // Si la solicitud ya no está activa, removerla del array
        if (request.isActive === false) {
          if (index !== -1) {
            this.allRequests.splice(index, 1);
            // Limpiar del mapa de selecciones si estaba seleccionada
            this.removeFromSelectionMap(request.id);
          }
        } else {
          // Si está activa, actualizar o agregar
          if (index !== -1) {
            this.allRequests[index] = request;
          } else {
            this.allRequests.push(request);
          }
        }

        this.groupedRequests = this.groupByDA(this.allRequests);
      }
    );

    // Suscribirse a las notificaciones de cambios
    this.signalRNotificationSubscription = this.signalR.fundingRequestNotification$.subscribe(
      (notification) => {
        this.notificationService.addNotification(notification);
      }
    );

    // Suscribirse al evento de highlight
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
      requests: reqs
    }));
  }

  selectedRequestsMap = new Map<string, FundingRequestAdminResponseDto[]>();

  onSelectedRequestsChanged(daTitle: string, selected: FundingRequestAdminResponseDto[]) {
    this.selectedRequestsMap.set(daTitle, selected);
  }

  private removeFromSelectionMap(requestId: number): void {
    // Recorrer todas las entradas del mapa y remover la solicitud si está seleccionada
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

    const requests = allSelected.map(req =>
      this.fundingService.changeIsActive(req.id!)
    );

    forkJoin(requests).subscribe({
      next: updatedList => {
        this.messageBox.show('Las solicitudes seleccionadas fueron aprobadas y ahora son visibles en la pestaña "Solicitudes aprobadas".', 'success', 'Exito');
        // Limpiar todas las selecciones después de la operación exitosa
        this.clearAllSelections();
        // No recargar la ruta - SignalR actualiza automáticamente
      },
      error: err => {
        this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo ' + err, 'error');
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

    // Group selected requests by D.A.
    const groupedSelected: { [da: number]: FundingRequestAdminResponseDto[] } = {};
    allSelected.forEach(req => {
      if (!groupedSelected[req.da]) {
        groupedSelected[req.da] = [];
      }
      groupedSelected[req.da].push(req);
    });

    // Sort D.A. groups by number
    const sortedDAs = Object.keys(groupedSelected).map(Number).sort((a, b) => a - b);

    const tsvParts: string[] = [];

    sortedDAs.forEach((da, index) => {
      // Add headers
      tsvParts.push(headers.join('\t'));

      // Group by checking account within this D.A.
      const groupedByAccount: { [checkingAccount: string]: FundingRequestAdminResponseDto[] } = {};
      groupedSelected[da].forEach(req => {
        if (!groupedByAccount[req.checkingAccount]) {
          groupedByAccount[req.checkingAccount] = [];
        }
        groupedByAccount[req.checkingAccount].push(req);
      });

      // Sort checking accounts alphabetically
      const sortedAccounts = Object.keys(groupedByAccount).sort();

      sortedAccounts.forEach(checkingAccount => {
        // Add rows for this checking account
        const accountRows = groupedByAccount[checkingAccount].map(req => [
          req.da,
          req.requestNumber,
          req.fiscalYear,
          req.paymentOrderNumber,
          req.concept,
          req.dueDate || '',
          formatCurrency(req.amount),
          req.fundingSource,
          req.checkingAccount
        ]);

        tsvParts.push(...accountRows.map(row => row.join('\t')));
      });

      // Add empty row between D.A. groups (except for the last one)
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

  changeOnWorkState() {
    const allSelected: FundingRequestAdminResponseDto[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas.', 'info', 'Atención');
      return;
    }

    const requests = allSelected.map(req =>
      this.fundingService.changeOnWork(req.id!)
    );

    forkJoin(requests).subscribe({
      next: updatedList => {
        this.messageBox.show('Se cambió el estado "en revision" de las solicitudes seleccionadas.', 'success', 'Exito');
        // Limpiar todas las selecciones después de la operación exitosa
        this.clearAllSelections();
        // No recargar la ruta - SignalR actualiza automáticamente
      },
      error: err => {
        this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo '+err, 'error');
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
    // Limpiar el mapa de selecciones
    this.selectedRequestsMap.clear();

    // Limpiar los SelectionModel de cada card
    this.daCards.forEach(card => {
      card.selection.clear();
      card.emitSelected();
    });
  }

  highlightRequest(requestId: number): void {
    // Verificar si la solicitud existe en el dashboard
    const request = this.allRequests.find(r => r.id === requestId);

    if (!request) {
      console.log('Solicitud no encontrada en el dashboard:', requestId);
      return;
    }

    // Marcar como highlighted
    this.highlightedRequestId = requestId;

    // Hacer scroll a la solicitud después de un pequeño delay (para que Angular actualice el DOM)
    setTimeout(() => {
      const element = document.getElementById(`request-${requestId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Quitar highlight después de 5 segundos
    setTimeout(() => {
      this.highlightedRequestId = null;
    }, 5000);
  }

  ngOnDestroy() {
    this.signalRSubscription?.unsubscribe();
    this.signalRNotificationSubscription?.unsubscribe();
    this.highlightSubscription?.unsubscribe();
    this.signalR.stopConnection();
  }

}