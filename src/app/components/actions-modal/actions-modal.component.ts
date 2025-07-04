import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FundingRequest } from '../../models/funding-request';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-actions-modal',
  imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './actions-modal.component.html',
  styleUrls: ['./actions-modal.component.scss']
})
export class ActionsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ActionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FundingRequest,
    private fundingRequestService: FundingRequestService
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  onToggleActive(): void {
    if (!this.data?.id) return;

    this.fundingRequestService.changeIsActive(this.data.id).subscribe({
      next: updatedRequest => {
        this.dialogRef.close({ updatedRequest }); 
      },
      error: err => {
        console.error('Error al cambiar estado activo', err);
      }
    });
  }

}
