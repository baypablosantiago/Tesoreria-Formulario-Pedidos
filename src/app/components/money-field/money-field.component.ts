import { Component, signal, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'app-money-field',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './money-field.component.html',
  styleUrl: './money-field.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MoneyFieldComponent {
  readonly moneyField = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{1,3}(\.\d{3})*(,\d{0,2})?$/)
  ]);

  errorMessage = signal('');

  constructor() {
    merge(this.moneyField.statusChanges, this.moneyField.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.moneyField.hasError('required')) {
      this.errorMessage.set('Requerido.');
    } else {
      this.errorMessage.set('');
    }
  }

  onMoneyInput() {
    let raw = this.moneyField.value || '';

    raw = raw.replace(/[^0-9,]/g, ''); //regex para eliminar todo lo que no sean digitos y la coma

    const parts = raw.split(',');
    if (parts.length > 2) {
      raw = parts[0] + ',' + parts[1]; // esto descarta comas extra, si las hubiera
    }

    this.moneyField.setValue(raw, { emitEvent: false });
  }

  formatMoneyField() {
  let value = this.moneyField.value;
  if (!value) {
    this.updateErrorMessage();
    return;
  }

  const numericString = value.replace(/\./g, '').replace(',', '.');
  const number = parseFloat(numericString);

  if (isNaN(number)) return;

  const formatted = number.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  this.moneyField.setValue(formatted, { emitEvent: false });
  }
}
