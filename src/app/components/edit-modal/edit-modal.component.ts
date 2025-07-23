import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FundingRequest } from '../../models/funding-request';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './edit-modal.component.html',
  styleUrls: [ './edit-modal.component.scss']
})
export class EditModalComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EditModalComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: FundingRequest
  ) {
    this.form = this.fb.group({
      concept: [data.concept],
      amount: [data.amount],
      comments: [data.comments]
      // Agregá los campos que quieras permitir editar
    });
  }

  save(): void {
    if (this.form.valid) {
      const updatedRequest = {
        ...this.data,
        ...this.form.value
      };
      this.dialogRef.close(updatedRequest);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
