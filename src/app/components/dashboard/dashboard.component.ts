import { Component } from '@angular/core';
import { DaCardComponent } from "../da-card/da-card.component";
import { CommonModule } from '@angular/common';
import { FundingRequest } from '../../models/funding-request';
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

  allRequests: FundingRequest[] = []

  ngOnInit() {
    this.fundingService.getAllActiveFundingRequests().subscribe(
      (requests) => {
        this.allRequests = requests;
        this.groupedRequests = this.groupByDA(requests);
      }
    );
  }

  groupedRequests: { da: number; requests: FundingRequest[] }[] = [];

  private groupByDA(requests: FundingRequest[]) {
    const grouped: { [da: number]: FundingRequest[] } = {};

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

  selectedRequestsMap = new Map<string, FundingRequest[]>(); 

  onSelectedRequestsChanged(daTitle: string, selected: FundingRequest[]) {
    this.selectedRequestsMap.set(daTitle, selected);
  }

  changeIsActiveState() {
    const allSelected: FundingRequest[] = Array.from(this.selectedRequestsMap.values()).flat();

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
        this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo '+err, 'error');
      }
    });
  }


copyToClipboard() {
  const allSelected: FundingRequest[] = Array.from(this.selectedRequestsMap.values()).flat();

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



}