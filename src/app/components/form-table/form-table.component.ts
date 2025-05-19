import { AfterViewInit, Component, ViewChild, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { TextFieldComponent } from '../text-field/text-field.component';
import { NumberFieldComponent } from '../number-field/number-field.component';
import { MoneyFieldComponent } from '../money-field/money-field.component';
import { SendButtonComponent } from '../send-button/send-button.component';
import { UnrequiredTextFieldComponent } from "../unrequired-text-field/unrequired-text-field.component";
import { RowsPanelComponent } from "../rows-panel/rows-panel.component";

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
    UnrequiredTextFieldComponent,
    RowsPanelComponent
  ],
  standalone: true
})
export class FormTableComponent implements AfterViewInit {
  isDisabled = false;
  @ViewChild(MatTable) table!: MatTable<any>;

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
    Array.from({ length: 3 }).forEach(() => this.addRow());
    this.table.dataSource = this.rows.controls;
  }

  addRow() {
    const row = new FormGroup({
      DA: new FormControl('', Validators.required),
      nroSolicitud: new FormControl('', Validators.required),
      ejercicio: new FormControl('', Validators.required),
      ordenPago: new FormControl('', Validators.required),
      concepto: new FormControl('', Validators.required),
      vencimiento: new FormControl('', Validators.required),
      importe: new FormControl('', Validators.required),
      fuenteFinanciamiento: new FormControl('', Validators.required),
      cuentaCorriente: new FormControl('', Validators.required),
      comentarios: new FormControl('')
    });

    this.rows.push(row);

    if (this.table) {
      this.table.renderRows();
    }
  }

  private isRowEmpty(row: FormGroup): boolean {
    return Object.values(row.controls).every(control => {
      const value = control.value;
      return value === null || value === undefined || String(value).trim() === '';
    });
  }

  removeRow() {
    const lastIndex = this.rows.length - 1;
    const lastRow = this.rows.at(lastIndex) as FormGroup;

    if (lastIndex == 0) {
      console.warn('Debe haber por lo menos una fila en existencia.');
    } else {
      if (this.isRowEmpty(lastRow)) {
        this.rows.removeAt(lastIndex);
        this.table.renderRows();
      } else {
        console.warn('No se puede eliminar una fila que contiene datos.');
      }
    }
  }

  onSubmit(): void {
    const formGroup = this.form();

    if (formGroup.valid) {
      console.log('Formulario enviado:', formGroup.value);
      this.isDisabled = true;
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
    })
  }
}