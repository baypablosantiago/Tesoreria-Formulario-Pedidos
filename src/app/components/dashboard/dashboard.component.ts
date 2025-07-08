import { Component } from '@angular/core';
import { DaCardComponent } from "../da-card/da-card.component";
import { CommonModule } from '@angular/common';
import { FundingRequest } from '../../models/funding-request';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MessageBoxService } from '../../services/message-box.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [DaCardComponent, CommonModule, MatButtonModule]
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

  generateExcel() {
    alert("Aca se va a generar un excel");
  }

  selectedRequestsMap = new Map<string, FundingRequest[]>(); 

  onSelectedRequestsChanged(daTitle: string, selected: FundingRequest[]) {
    this.selectedRequestsMap.set(daTitle, selected);
  }

  changeIsActiveState() {
    const allSelected: FundingRequest[] = Array.from(this.selectedRequestsMap.values()).flat();

    if (allSelected.length === 0) {
      this.messageBox.show('No hay solicitudes seleccionadas.', 'info', 'Atencion');
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
}