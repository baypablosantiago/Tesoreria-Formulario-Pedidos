import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FundingRequest } from '../../models/funding-request';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldComponent } from '../form-table-components/text-field/text-field.component';
import { NumberFieldComponent } from '../form-table-components/number-field/number-field.component';
import { MoneyFieldComponent } from '../form-table-components/money-field/money-field.component';
import { DateFieldComponent } from '../form-table-components/date-field/date-field.component';
import { DropdownFieldComponent } from '../form-table-components/dropdown-field/dropdown-field.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    TextFieldComponent,
    NumberFieldComponent,
    MoneyFieldComponent,
    DateFieldComponent,
    DropdownFieldComponent,
    MatDialogModule,
    MatNativeDateModule,
    MatDatepickerModule
],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss']
})
export class EditModalComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FundingRequest,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      comments: [data.comments],
      requestNumber: [data.requestNumber],
      fiscalYear: [data.fiscalYear],
      paymentOrderNumber: [data.paymentOrderNumber],
      concept: [data.concept],
      dueDate: [data.dueDate],
      amount: [data.amount],
      fundingSource: [data.fundingSource],
      checkingAccount: [data.checkingAccount]
    });
  }

  save(): void {
    if (this.form.valid) {
      const updated = {
        ...this.data,
        ...this.form.value
      };
      this.dialogRef.close(updated);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
