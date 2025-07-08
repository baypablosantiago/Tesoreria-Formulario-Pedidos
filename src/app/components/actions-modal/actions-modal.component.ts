import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FundingRequest } from '../../models/funding-request';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-actions-modal',
  standalone: true,
  imports: 
  [ CommonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatSlideToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './actions-modal.component.html',
  styleUrls: ['./actions-modal.component.scss']
})
export class ActionsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ActionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FundingRequest,
    private fundingRequestService: FundingRequestService,
    private router: Router
  ) {}

  partialPaymentAmount?: number;
  isSubmitting = false;
  success = false;
  error = false;

  close(): void {
    this.dialogRef.close();
    this.reloadCurrentRoute();      
  }

  private reloadCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  submitPartialPayment() {
    if (!this.partialPaymentAmount || this.partialPaymentAmount <= 0 || !this.data.id) return;

    this.isSubmitting = true;
    this.success = false;
    this.error = false;

    this.fundingRequestService.addPartialPayment(this.data.id, this.partialPaymentAmount).subscribe({
      next: updated => {
        this.isSubmitting = false;
        this.success = true;
        this.data.partialPayment = updated.partialPayment;
        this.partialPaymentAmount = 0;
      },
      error: err => {
        console.error('Error al registrar pago parcial', err);
        this.isSubmitting = false;
        this.error = true;
      }
    });
  }
}