import { Component, forwardRef, signal, Input } from '@angular/core';
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

  @Input() options: (string | number)[] = [
    'Proveedores',
    'Gastos varios',
    'Subsidios',
    'Viáticos',
    'Servicios',
    'Compensaciones por residencia',
    'Publicidad',
    'Alquiler de inmueble',
    'ENERSA',
    'Contratos: de Pasantía - de obra',
    'Juntas de Gobierno',
    'Deuda por obra pública',
    'Subsidio al transporte público',
    'Ley 4035',
    'Partida Hospitales y Centros de Salud',
    'Guardias Hospitalarias',
    'IAPSER',
  ];

  @Input() placeholder: string = 'Seleccione una opción';
  errorMessage = signal('');

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    merge(this.field.statusChanges, this.field.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.onChange(this.field.value);
      });
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
