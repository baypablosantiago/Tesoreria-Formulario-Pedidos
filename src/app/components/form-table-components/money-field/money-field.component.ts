import { Component, signal, ViewEncapsulation, forwardRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';

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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyFieldComponent),
      multi: true
    }
  ]
})
export class MoneyFieldComponent implements ControlValueAccessor {
  readonly moneyField = new FormControl('', [
    Validators.pattern(/^\d{1,3}(\.\d{3})*(,\d{0,2})?$/)
  ]);

  errorMessage = signal('');

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor() {
    merge(this.moneyField.statusChanges, this.moneyField.valueChanges)
  .pipe(takeUntilDestroyed())
  .subscribe(() => {
    this.updateErrorMessage();

    const parsedValue = this.parseToNumber(this.moneyField.value);
    this.onChange(parsedValue);
  });
  }

  writeValue(value: any): void {
    this.moneyField.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.moneyField.disable() : this.moneyField.enable();
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
    raw = raw.replace(/[^0-9,]/g, '');
    const parts = raw.split(',');
    if (parts.length > 2) {
      raw = parts[0] + ',' + parts[1];
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

  private parseToNumber(value: string | null): number | null {
  if (!value) return null;
  const numericString = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const num = parseFloat(numericString);
  return isNaN(num) ? null : num;
}

}
