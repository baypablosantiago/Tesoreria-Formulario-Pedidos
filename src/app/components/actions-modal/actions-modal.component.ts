import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FundingRequestAdminResponseDto, PartialPaymentUpdateDto, CommentsFromTesoDto, PartialPayment } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MessageBoxService } from '../../services/message-box.service';

@Component({
  selector: 'app-actions-modal',
  standalone: true,
  imports:
    [CommonModule,
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
    @Inject(MAT_DIALOG_DATA) public data: FundingRequestAdminResponseDto,
    private fundingRequestService: FundingRequestService,
    private router: Router,
    private messageBox: MessageBoxService
  ) {
    this.loadPaymentHistory();
    this.newComment = this.data.commentsFromTeso || '';
  }

  partialPaymentAmount?: number;
  isSubmitting = false;
  success = false;
  error = false;

  newComment = '';
  isCommentSubmitting = false;
  commentSuccess = false;
  commentError = false;

  // Propiedades para historial de pagos
  paymentHistory: PartialPayment[] = [];
  isLoadingHistory = false;
  isDeletingPayment = false;

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
    if (this.partialPaymentAmount == null || !this.data.id) {
    this.success = false;
    this.error = true;
    return;
  }

    this.isSubmitting = true;
    this.success = false;
    this.error = false;

    const dto: PartialPaymentUpdateDto = { partialPayment: this.partialPaymentAmount };
    this.fundingRequestService.addPartialPayment(this.data.id, dto).subscribe({
      next: updated => {
        this.isSubmitting = false;
        this.success = true;
        this.data.partialPayment = updated.partialPayment;
        this.partialPaymentAmount = undefined;
        // Recargar historial después de agregar pago
        this.loadPaymentHistory();
      },
      error: err => {
        this.isSubmitting = false;
        this.error = true;
      }
    });
  }


  submitComment() {
  const trimmedComment = this.newComment.trim();

  if (!trimmedComment || !this.data.id) return;

  this.isCommentSubmitting = true;
  this.commentSuccess = false;
  this.commentError = false;

  const dto: CommentsFromTesoDto = { comment: trimmedComment };
  this.fundingRequestService.addComment(this.data.id, dto).subscribe({
    next: () => {
      this.isCommentSubmitting = false;
      this.commentSuccess = true;
      this.data.commentsFromTeso = trimmedComment; 
    },
    error: () => {
      this.isCommentSubmitting = false;
      this.commentError = true;
    }
  });
}

  // Métodos para historial de pagos
  private loadPaymentHistory(): void {
    this.isLoadingHistory = true;
    this.fundingRequestService.getPartialPaymentHistory(this.data.id).subscribe({
      next: (history) => {
        this.paymentHistory = history;
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error cargando historial de pagos:', error);
        this.isLoadingHistory = false;
      }
    });
  }

  deletePayment(paymentId: number): void {
    this.messageBox.confirm(
      '¿Está seguro que desea eliminar este pago parcial?',
      'Confirmar eliminación'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.isDeletingPayment = true;

      this.fundingRequestService.deletePartialPayment(paymentId).subscribe({
        next: () => {
          // Recargar historial y recalcular total
          this.loadPaymentHistory();

          // Recalcular total local (simple suma)
          const deletedPayment = this.paymentHistory.find(p => p.id === paymentId);
          if (deletedPayment) {
            this.data.partialPayment -= deletedPayment.amount;
          }

          this.isDeletingPayment = false;
        },
        error: (error) => {
          console.error('Error eliminando pago:', error);
          this.isDeletingPayment = false;
          this.messageBox.show('Error al eliminar el pago parcial', 'error');
        }
      });
    });
  }

}