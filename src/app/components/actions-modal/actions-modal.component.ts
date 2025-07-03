import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FundingRequest } from '../../models/funding-request';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MoneyFieldComponent } from "../money-field/money-field.component";
import { FundingRequestService } from '../../services/funding-request.service';

@Component({
  selector: 'app-actions-modal',
  imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule],
  templateUrl: './actions-modal.component.html',
  styleUrls: ['./actions-modal.component.scss']
})
export class ActionsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ActionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FundingRequest,
    private fundingRequestSerice:FundingRequestService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

}
