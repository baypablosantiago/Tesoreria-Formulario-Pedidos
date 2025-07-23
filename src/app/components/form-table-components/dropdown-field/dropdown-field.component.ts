import { Component, forwardRef, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './dropdown-field.component.html',
  styleUrl: './dropdown-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownFieldComponent),
      multi: true
    }
  ]
})
export class DropdownFieldComponent implements ControlValueAccessor {
  readonly field = new FormControl('', [Validators.required]);

  readonly conceptOptions: string[] = [
    'Pago a proveedor',
    'Servicios contratados',
    'Obra pública',
    'Honorarios profesionales',
    'Otros'
  ];

  readonly placeholder = 'Seleccione una opción';
  errorMessage = signal('');

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    merge(this.field.statusChanges, this.field.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.updateErrorMessage();
        this.onChange(this.field.value);
      });
  }

  updateErrorMessage() {
    if (this.field.hasError('required')) {
      this.errorMessage.set('Requerido.');
    } else {
      this.errorMessage.set('');
    }
  }

  writeValue(value: any): void {
    this.field.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.field.disable() : this.field.enable();
  }
}
