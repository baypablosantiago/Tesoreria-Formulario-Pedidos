import { AfterViewInit, Component, ViewChild, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { TextFieldComponent } from '../text-field/text-field.component';
import { NumberFieldComponent } from '../number-field/number-field.component';
import { MoneyFieldComponent } from '../money-field/money-field.component';
import { SendButtonComponent } from '../send-button/send-button.component';

@Component({
  selector: 'app-form-table',
  templateUrl: './form-table.component.html',
  styleUrl: './form-table.component.scss',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    TextFieldComponent,
    NumberFieldComponent,
    MoneyFieldComponent,
    SendButtonComponent,
  ],
  standalone: true
})
export class FormTableComponent implements AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<any>;

  // Form con FormArray de filas
  form = signal<FormGroup>(
    new FormGroup({
      rows: new FormArray([])
    })
  );

  get rows(): FormArray {
    return this.form().get('rows') as FormArray;
  }

  displayedColumns = [
    'D.A.',
    'N° de Solicitud',
    'Ejercicio',
    'N° de Orden de Pago',
    'Concepto, Proveedor o Contratista',
    'Vencimiento y/o Periodo',
    'Importe Solicitado',
    'Fuente de Financiamiento',
    'Cuenta Corriente a la cual acreditar',
    'Notas / Comentarios'
  ];

  ngAfterViewInit(): void {
    // Inicializamos con 6 filas vacías como en tu ejemplo
    Array.from({ length: 2 }).forEach(() => this.addRow());
    this.table.dataSource = this.rows.controls;
  }

  addRow() {
    const row = new FormGroup({
      DA: new FormControl('', Validators.required),
      nroSolicitud: new FormControl('', Validators.required),
      ejercicio: new FormControl(''),
      ordenPago: new FormControl(''),
      concepto: new FormControl(''),
      vencimiento: new FormControl(''),
      importe: new FormControl(''),
      fuenteFinanciamiento: new FormControl(''),
      cuentaCorriente: new FormControl(''),
      comentarios: new FormControl('')
    });

    this.rows.push(row);

    if (this.table) {
      this.table.renderRows();
    }
  }

  removeRow(index: number) {
    this.rows.removeAt(index);
    this.table.renderRows();
  }

  onSubmit(): void {
  const formGroup = this.form();

  if (formGroup.valid) {
    console.log('Formulario enviado:', formGroup.value);
  } else {
    console.warn('Formulario inválido. Por favor, completá los campos requeridos.');
    this.markAllControlsAsTouched(formGroup);
  }
}

private markAllControlsAsTouched(formGroup: FormGroup | FormArray): void {
  Object.values(formGroup.controls).forEach(control => {
    if (control instanceof FormGroup || control instanceof FormArray) {
      this.markAllControlsAsTouched(control);
    } else {
      control.markAsTouched();
    }
  });
}
}