import { Component, OnInit } from '@angular/core';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequestAdminResponseDto } from '../../models';
import { MonthGroup } from '../../models/month-group';
import { DaCardComponent } from "../da-card/da-card.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MessageBoxService } from '../../services/message-box.service';
import { forkJoin } from 'rxjs';
import { MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-finished-request',
  imports: [DaCardComponent, MatExpansionModule, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './finished-requests.component.html',
  styleUrls: ['./finished-requests.component.scss']
})
export class FinishedRequestsComponent implements OnInit {
  groupedRequests: MonthGroup[] = [];

  constructor(
    private fundingRequestService: FundingRequestService,
    private router: Router,
    private messageBox: MessageBoxService) { }

  ngOnInit(): void {
    this.fundingRequestService.getAllInactiveFundingRequests()
      .subscribe(requests => {
        const grouped: { [month: string]: { [da: string]: FundingRequestAdminResponseDto[] } } = {};

        for (const req of requests) {
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
        this.reloadCurrentRoute(); 
      },
      error: err => {
        this.messageBox.show('Ocurrió un error al cambiar los estados. Informe a desarrollo. Codigo '+err, 'error');
      }
    });
  }
}
