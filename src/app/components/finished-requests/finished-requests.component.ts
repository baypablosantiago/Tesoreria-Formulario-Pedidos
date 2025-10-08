import { Component, OnInit, OnDestroy } from '@angular/core';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequestAdminResponseDto } from '../../models';
import { MonthGroup } from '../../models/month-group';
import { DaCardComponent } from "../da-card/da-card.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MessageBoxService } from '../../services/message-box.service';
import { forkJoin, Subscription } from 'rxjs';
import { MatIconModule } from "@angular/material/icon";
import { SignalRService } from '../../services/signalr.service';


@Component({
  selector: 'app-finished-request',
  imports: [DaCardComponent, MatExpansionModule, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './finished-requests.component.html',
  styleUrls: ['./finished-requests.component.scss']
})
export class FinishedRequestsComponent implements OnInit, OnDestroy {
  groupedRequests: MonthGroup[] = [];
  private signalRSubscription?: Subscription;
  private allRequests: FundingRequestAdminResponseDto[] = [];

  constructor(
    private fundingRequestService: FundingRequestService,
    private router: Router,
    private messageBox: MessageBoxService,
    private signalR: SignalRService) { }

  ngOnInit(): void {
    this.fundingRequestService.getAllInactiveFundingRequests()
      .subscribe(requests => {
        this.allRequests = requests;
        this.regroupRequests();
      });

    // Iniciar conexión SignalR
    this.signalR.startConnection();

    // Suscribirse a cambios en tiempo real
    this.signalRSubscription = this.signalR.fundingRequestChanged$.subscribe(
      (request) => {
        const index = this.allRequests.findIndex(r => r.id === request.id);

        // Si la solicitud ahora está inactiva (finalizada), agregarla o actualizarla
        if (request.isActive === false) {
          if (index !== -1) {
            // Actualizar solicitud existente
            this.allRequests[index] = request;
          } else {
            // Agregar nueva solicitud finalizada
            this.allRequests.push(request);
          }
        } else {
          // Si la solicitud volvió a estar activa, removerla de finalizadas
          if (index !== -1) {
            this.allRequests.splice(index, 1);
            // Limpiar del mapa de selecciones si estaba seleccionada
            this.removeFromSelectionMap(request.id);
          }
        }

        // Reagrupar para reflejar los cambios
        this.regroupRequests();
      }
    );
  }

  private regroupRequests(): void {
    const grouped: { [month: string]: { [da: string]: FundingRequestAdminResponseDto[] } } = {};

    for (const req of this.allRequests) {
      const date = new Date(req.receivedAt!);
      const monthKey = this.formatYearMonth(date);

      if (!grouped[monthKey]) grouped[monthKey] = {};
      if (!grouped[monthKey][req.da]) grouped[monthKey][req.da] = [];

      grouped[monthKey][req.da].push(req);
    }

    this.groupedRequests = Object.entries(grouped).map(([month, daMap]) => ({
      month,
      groupedByDA: Object.entries(daMap).map(([da, requests]) => ({
        da,
        requests
      }))
    }));
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

  getTotalRequests(monthGroup: MonthGroup): number {
    return monthGroup.groupedByDA.reduce((total, daGroup) => total + daGroup.requests.length, 0);
  }

  formatYearMonth(date: Date): string {
    const month = date.toLocaleString('es-AR', { month: 'long' });
    const year = date.getFullYear();
    return `${year} - ${this.capitalize(month)}`;
  }

  capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private reloadCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
}

selectedRequestsMap = new Map<string, FundingRequestAdminResponseDto[]>(); 

  onSelectedRequestsChanged(daTitle: string, selected: FundingRequestAdminResponseDto[]) {
    this.selectedRequestsMap.set(daTitle, selected);
  }

  changeIsActiveState() {
    const allSelected: FundingRequestAdminResponseDto[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas.', 'info', 'Atención');
      return;
    }

    const requests = allSelected.map(req =>
      this.fundingRequestService.changeIsActive(req.id!)
    );

    forkJoin(requests).subscribe({
      next: updatedList => {
        this.messageBox.show('Las solicitudes seleccionadas fueron devueltas a la pestaña "Solicitudes pendientes".', 'success', 'Exito');
        // No recargar la ruta - SignalR actualiza automáticamente
      },
      error: err => {
        this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo '+err, 'error');
      }
    });
  }

  trackByMonth(index: number, item: MonthGroup): string {
    return item.month;
  }

  trackByDA(index: number, item: { da: string; requests: FundingRequestAdminResponseDto[] }): string {
    return item.da;
  }

  ngOnDestroy(): void {
    this.signalRSubscription?.unsubscribe();
    this.signalR.stopConnection();
  }
}
