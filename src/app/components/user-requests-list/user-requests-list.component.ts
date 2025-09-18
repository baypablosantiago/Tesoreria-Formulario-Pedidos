import { Component, inject, Input } from '@angular/core';
import { FundingRequestResponseDto, PartialPayment } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { FundingRequestService } from '../../services/funding-request.service';

@Component({
  selector: 'app-user-requests-list',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './user-requests-list.component.html',
  styleUrls: ['./user-requests-list.component.scss']
})
export class UserRequestsListComponent {
  @Input() requests: FundingRequestResponseDto[] = [];
  @Input() showCompleted: boolean = false;

  private expandedHistories = new Set<number>();
  private loadingHistories = new Set<number>();
  private paymentHistories = new Map<number, PartialPayment[]>();

  constructor(private dialog: MatDialog, private fundingRequestService: FundingRequestService){}

onEdit(req: FundingRequestResponseDto): void {
  const dialogRef = this.dialog.open(EditModalComponent, {
      data: req,
      autoFocus: false,
      width: '70vw',
      maxWidth: '70vw',
      height: '500px',
      maxHeight: '500px',
      disableClose: true
  });
}


  getRequestStatus(req: FundingRequestResponseDto): string {
    if (!req.isActive) return 'Finalizada';
    if (req.partialPayment > 0) return 'Pago parcial';
    if (req.onWork) return 'En revisión'
    return 'Pendiente';
  }

  getStatusClass(req: FundingRequestResponseDto): string {
    if (!req.isActive) return 'completed';
    if (req.partialPayment > 0) return 'partial';
    return 'pending';
  }

  getChipClass(req: FundingRequestResponseDto): string {
    return `chip ${this.getStatusClass(req)}`;
  }

  isEditable(req: FundingRequestResponseDto): boolean {
    return req.isActive && req.partialPayment === 0;
  }

  getPartialPaymentClass(req: FundingRequestResponseDto): string {
    if (!req.isActive) return 'completed'; // Azul para finalizadas
    return 'warning'; // Amarillo para activas con pago parcial
  }


  togglePaymentHistory(requestId: number): void {
    if (this.expandedHistories.has(requestId)) {
      this.expandedHistories.delete(requestId);
    } else {
      this.expandedHistories.add(requestId);

      if (!this.paymentHistories.has(requestId)) {
        this.loadPaymentHistory(requestId);
      }
    }
  }

  isHistoryExpanded(requestId: number): boolean {
    return this.expandedHistories.has(requestId);
  }

  isLoadingHistory(requestId: number): boolean {
    return this.loadingHistories.has(requestId);
  }

  getPaymentHistory(requestId: number): PartialPayment[] | undefined {
    return this.paymentHistories.get(requestId);
  }

  private loadPaymentHistory(requestId: number): void {
    this.loadingHistories.add(requestId);

    this.fundingRequestService.getPartialPaymentHistory(requestId).subscribe({
      next: (history) => {
        this.paymentHistories.set(requestId, history);
        this.loadingHistories.delete(requestId);
      },
      error: (error) => {
        console.error('Error cargando historial de pagos:', error);
        this.loadingHistories.delete(requestId);
      }
    });
  }
}