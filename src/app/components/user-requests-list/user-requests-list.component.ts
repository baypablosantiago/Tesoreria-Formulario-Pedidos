import { Component, inject, Input } from '@angular/core';
import { FundingRequestResponseDto } from '../../models';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-requests-list',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './user-requests-list.component.html',
  styleUrls: ['./user-requests-list.component.scss']
})
export class UserRequestsListComponent {
  @Input() requests: FundingRequestResponseDto[] = [];
  @Input() showCompleted: boolean = false;

  constructor(private dialog: MatDialog){}

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

  // dialogRef.afterClosed().subscribe((result: FundingRequest | undefined) => {
  //   if (result) {
  //     console.log('Solicitud actualizada:', result);
  //     // Comentado, podria ser util mas adelante
  //   }
  // });
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
}