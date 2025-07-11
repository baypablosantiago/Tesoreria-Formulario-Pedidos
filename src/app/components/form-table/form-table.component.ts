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
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequest } from '../../models/funding-request';

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

  constructor(private fundingService: FundingRequestService) { }

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
    Array.from({ length: 1 }).forEach(() => this.addRow());
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

    if (this.rows.length < 10) {
      this.rows.push(row);

      if (this.table) {
        this.table.renderRows();
      }
    } else {
      this.messageBox.show('Puede enviar formularios de hasta 10 filas como máximo.', 'info', 'Máximo de filas alcanzado.');
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
      this.messageBox.show('Debe haber por lo menos una fila en existencia.', 'info', 'Minimo de celdas alcanzado.');
    } else {
      if (this.isRowEmpty(lastRow)) {
        this.rows.removeAt(lastIndex);
        this.table.renderRows();
      } else {
        this.messageBox.show('No se puede eliminar una fila que contiene datos. Verifique la ultima fila.', 'warning', 'Atención.');
      }
    }
  }

  submitRequest(): void {
    const formGroup = this.form();

    if (formGroup.valid) {
      const requests: FundingRequest[] = this.rows.controls.map(row => ({
        da: +row.get('DA')?.value,
        requestNumber: +row.get('nroSolicitud')?.value,
        fiscalYear: +row.get('ejercicio')?.value,
        paymentOrderNumber: +row.get('ordenPago')?.value,
        concept: row.get('concepto')?.value,
        dueDate: row.get('vencimiento')?.value,
        amount: +row.get('importe')?.value,
        fundingSource: row.get('fuenteFinanciamiento')?.value,
        checkingAccount: row.get('cuentaCorriente')?.value,
        partialPayment: 0,
        comments: row.get('comentarios')?.value || ''
      }));

      let hasError = false;
      let responses = 0;

      requests.forEach(req => {
        this.fundingService.addFundingRequest(req).subscribe({
          next: () => {
            responses++;
            if (responses === requests.length && !hasError) {
              this.messageBox.show(
                'Las solicitudes fueron enviadas correctamente y entrarán en revisión por el personal de la Tesorería General.',
                'success',
                'Formulario enviado.'
              );
              this.isDisabled = true;
            }
          },
          error: (err) => {
            hasError = true;
            this.messageBox.show(
              'Ocurrió un error al enviar una solicitud. Informe a Tesorería.',
              'error',
              'Error de servidor.'
            );
          }
        });
      });
    } else {
      this.messageBox.show(
        'Por favor, complete todos los campos requeridos. Use "Eliminar última fila" si tiene filas vacías.',
        'error',
        'Formulario incompleto.'
      );
    }
  }


}