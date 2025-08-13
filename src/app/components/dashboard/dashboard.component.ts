import { Component } from '@angular/core';
import { DaCardComponent } from "../da-card/da-card.component";
import { CommonModule } from '@angular/common';
import { FundingRequestAdminResponseDto } from '../../models';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MessageBoxService } from '../../services/message-box.service';
import { forkJoin } from 'rxjs';
import { MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [DaCardComponent, CommonModule, MatButtonModule, MatIconModule]
})
export class DashboardComponent {
  constructor(
    private fundingService: FundingRequestService,
    private router: Router,
    private messageBox: MessageBoxService) { }

  allRequests: FundingRequestAdminResponseDto[] = []

  ngOnInit() {
    this.fundingService.getAllActiveFundingRequests().subscribe(
      (requests) => {
        this.allRequests = requests;
        this.groupedRequests = this.groupByDA(requests);
      }
    );
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
      this.fundingService.changeIsActive(req.id!)
    );

    forkJoin(requests).subscribe({
      next: updatedList => {
        this.messageBox.show('Las solicitudes seleccionadas fueron aprobadas y ahora son visibles en la pestaña "Solicitudes aprobadas".', 'success', 'Exito');
        this.reloadCurrentRoute();
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
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      }).format(amount);
    };

    const rows = allSelected.map(req => [
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

    const tsvContent = rows.map(row => row.join('\t')).join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      this.messageBox.show('Datos copiados al portapapeles. Ahora podés pegarlos en Excel.', 'success');
    }).catch(err => {
      console.error('Error al copiar:', err);
      this.messageBox.show('No se pudo copiar al portapapeles.', 'error');
    });
  }

  getTotalAmount(requests: FundingRequestAdminResponseDto[]): number {
    return requests.reduce((sum, req) => sum + req.amount, 0);
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
        this.reloadCurrentRoute(); 
      },
      error: err => {
        this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo '+err, 'error');
      }
    });
  }

}