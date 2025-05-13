import { Component, signal, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-money-field',
  standalone: true,
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
    this.moneyField.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.moneyField.hasError('required')) {
      this.errorMessage.set('Requerido.');
    } else if (this.moneyField.hasError('pattern')) {
      this.errorMessage.set('Formato inválido. Use solo números y coma como separador decimal.');
    } else {
      this.errorMessage.set('');
    }
  }

  onMoneyInput() {
    let raw = this.moneyField.value || '';

    // Quitar todo excepto dígitos y coma
    raw = raw.replace(/[^0-9,]/g, '');

    // Solo permitir una coma
    const parts = raw.split(',');
    if (parts.length > 2) {
      raw = parts[0] + ',' + parts[1]; // descartar comas extra
    }

    this.moneyField.setValue(raw, { emitEvent: false });
  }

  formatMoneyField() {
    let value = this.moneyField.value;
    if (!value) return;

    // Convertir coma a punto para parsear
    const numericString = value.replace(',', '.');
    const number = parseFloat(numericString);

    if (isNaN(number)) return;

    // Formatear como 1.234,56 (de-DE usa punto como miles y coma como decimal)
    const formatted = number.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    this.moneyField.setValue(formatted, { emitEvent: false });
  }

}
