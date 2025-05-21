import { AfterViewInit, Component, ViewChild, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { TextFieldComponent } from '../text-field/text-field.component';
import { NumberFieldComponent } from '../number-field/number-field.component';
import { MoneyFieldComponent } from '../money-field/money-field.component';
import { SendButtonComponent } from '../send-button/send-button.component';
import { UnrequiredTextFieldComponent } from "../unrequired-text-field/unrequired-text-field.component";
import { AddRowButtonComponent } from "../add-row-button/add-row-button.component";
import { RemoveRowButtonComponent } from "../remove-row-button/remove-row-button.component";
import { MessageBoxService } from '../../services/message-box.service';

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
    AddRowButtonComponent,
    RemoveRowButtonComponent
],
  standalone: true
})
export class FormTableComponent implements AfterViewInit {
  isDisabled = false;
  @ViewChild(MatTable) table!: MatTable<any>;
  private readonly messageBox = inject(MessageBoxService);
  
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

    if (this.rows.length < 15)
    {
      this.rows.push(row);

      if (this.table) {
        this.table.renderRows();
      }
    } else {
      this.messageBox.show('Puede enviar formularios de hasta 15 filas como máximo.','info', 'Máximo de filas alcanzado.');
      console.log("Maximo de 15 filas")
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
      this.messageBox.show('Debe haber por lo menos una fila en existencia.','info', 'Minimo de celdas alcanzado.');
      console.warn('Debe haber por lo menos una fila en existencia.');
    } else {
      if (this.isRowEmpty(lastRow)) {
        this.rows.removeAt(lastIndex);
        this.table.renderRows();
      } else {
        this.messageBox.show('No se puede eliminar una fila que contiene datos. Verifique la ultima fila.', 'warning', 'Atención.');
        console.warn('No se puede eliminar una fila que contiene datos.');
      }
    }
  }

  onSubmit(): void {
    const formGroup = this.form();

    if (formGroup.valid) {
      this.messageBox.show('La solicitud fue enviada correctamente y entrará en revisión por el personal de la Tesoreria General.', 'success', 'Formulario enviado.');
      console.log('Formulario enviado:', formGroup.value);
      this.isDisabled = true;
    } else {
      this.messageBox.show('Por favor, complete todos los campos marcados como requeridos. Si tiene menos de 3 solicitudes, puede usar el boton "Eliminar ultima fila".', 'error', 'Campos incompletos.');
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