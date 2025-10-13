import { AfterViewInit, Component, ViewChild, inject, signal, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { TextFieldComponent } from '../form-table-components/text-field/text-field.component';
import { NumberFieldComponent } from '../form-table-components/number-field/number-field.component';
import { MoneyFieldComponent } from '../form-table-components/money-field/money-field.component';
import { MessageBoxService } from '../../services/message-box.service';
import { FundingRequestService } from '../../services/funding-request.service';
import { UserDaService } from '../../services/user-da.service';
import { DraftService } from '../../services/draft.service';
import { FundingRequestCreateDto, DraftRowData } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { DateFieldComponent } from '../form-table-components/date-field/date-field.component';
import { DropdownFieldComponent } from "../form-table-components/dropdown-field/dropdown-field.component";

@Component({
  selector: 'app-form-table',
  templateUrl: './form-table.component.html',
  styleUrl: './form-table.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    TextFieldComponent,
    NumberFieldComponent,
    MoneyFieldComponent,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    DateFieldComponent,
    DropdownFieldComponent
  ],
})
export class FormTableComponent implements OnInit, AfterViewInit {
  isDisabled = false;
  @ViewChild(MatTable) table!: MatTable<any>;
  private readonly messageBox = inject(MessageBoxService);

  form = signal<FormGroup>(
    new FormGroup({
      rows: new FormArray([])
    })
  );

  availableDAs: number[] = [];
  tableDataSource: any[] = [];

  constructor(
    private fundingRequestService: FundingRequestService,
    private userDaService: UserDaService,
    private draftService: DraftService
  ) { }

  get rows(): FormArray {
    return this.form().get('rows') as FormArray;
  }

  displayedColumns = [
    'D.A.',
    'N° de Solicitud',
    'Ejercicio',
    'N° de Orden de Pago',
    'Concepto, Proveedor o Contratista',
    'Vencimiento',
    'Importe Solicitado',
    'Fuente de Financiamiento',
    'Cuenta Corriente a la cual acreditar'
  ];

  ngOnInit(): void {
    this.userDaService.getUserDAs().subscribe({
      next: (das) => this.availableDAs = das,
      error: () => this.availableDAs = []
    });

    this.loadDraft();
  }

  ngAfterViewInit(): void {
    if (this.rows.length === 0) {
      Array.from({ length: 1 }).forEach(() => this.addRow());
    }
    this.updateTableDataSource();
  }

  updateTableDataSource(): void {
    this.tableDataSource = [];
    this.rows.controls.forEach((row, idx) => {
      this.tableDataSource.push({ row, isCommentRow: false, isDivider: false, requestIndex: idx });
      this.tableDataSource.push({ row, isCommentRow: true, isDivider: false, requestIndex: idx });
      if (idx < this.rows.length - 1) {
        this.tableDataSource.push({ row: null, isCommentRow: false, isDivider: true, requestIndex: idx });
      }
    });
    if (this.table) {
      this.table.renderRows();
    }
  }

  isDataRow = (index: number, item: any) => !item.isCommentRow && !item.isDivider;
  isCommentRow = (index: number, item: any) => item.isCommentRow && !item.isDivider;
  isDividerRow = (index: number, item: any) => item.isDivider;

  getRowClass(element: any): string {
    return element.requestIndex % 2 === 0 ? 'even-request' : 'odd-request';
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
      comentarios: new FormControl('', Validators.maxLength(500))
    });

    if (this.rows.length < 20) {
      this.rows.push(row);
      this.updateTableDataSource();
    } else {
      this.messageBox.show('Puede enviar formularios de hasta 20 filas como máximo.', 'info', 'Máximo de filas alcanzado.');
    }

  }

  private isRowEmpty(row: FormGroup): boolean {
    const keysToCheck = [
      'nroSolicitud',
      'ejercicio',
      'ordenPago',
      'importe',
      'fuenteFinanciamiento',
      'cuentaCorriente',
      'comentarios'
    ];

    return keysToCheck.every(key => {
      const control = row.get(key);
      if (!control) return true; // si no existe el control, lo consideramos vacío
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
        this.updateTableDataSource();
      } else {
        this.messageBox.show('No se puede eliminar una fila que contiene datos. Verifique la ultima fila.', 'warning', 'Fila con datos.');
      }
    }
  }

  submitRequest(): void {
    const formGroup = this.form();

    if (formGroup.valid) {
      const requests: FundingRequestCreateDto[] = this.rows.controls.map(row => ({
        da: +row.get('DA')?.value,
        requestNumber: +row.get('nroSolicitud')?.value,
        fiscalYear: +row.get('ejercicio')?.value,
        paymentOrderNumber: row.get('ordenPago')?.value,
        concept: row.get('concepto')?.value,
        dueDate: row.get('vencimiento')?.value,
        amount: +row.get('importe')?.value,
        fundingSource: row.get('fuenteFinanciamiento')?.value,
        checkingAccount: row.get('cuentaCorriente')?.value,
        comments: row.get('comentarios')?.value || ''
      }));

      let hasError = false;
      let responses = 0;

      requests.forEach(req => {
        this.fundingRequestService.addFundingRequest(req).subscribe({
          next: () => {
            responses++;
            if (responses === requests.length && !hasError) {
              // Delete draft after successful submission
              this.draftService.deleteDraft().subscribe();

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
            if (err.status === 500 && err.error && err.error.includes && err.error.includes('Ya existe una solicitud idéntica')) {
              this.messageBox.show(
                'Ya existe una solicitud idéntica con los mismos datos. Verifique sus solicitudes enviadas antes de enviar nuevamente.',
                'warning',
                'Solicitud duplicada.'
              );
            } else {
              this.messageBox.show(
                'Ocurrió un error al enviar una solicitud. Informe a Tesorería.',
                'error',
                'Error de servidor.'
              );
            }
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

  saveDraft(): void {
    const draftData: DraftRowData[] = this.rows.controls.map(row => ({
      DA: row.get('DA')?.value ?? '',
      nroSolicitud: row.get('nroSolicitud')?.value ?? '',
      ejercicio: row.get('ejercicio')?.value ?? '',
      ordenPago: row.get('ordenPago')?.value ?? '',
      concepto: row.get('concepto')?.value ?? '',
      vencimiento: row.get('vencimiento')?.value ?? '',
      importe: row.get('importe')?.value ?? '',
      fuenteFinanciamiento: row.get('fuenteFinanciamiento')?.value ?? '',
      cuentaCorriente: row.get('cuentaCorriente')?.value ?? '',
      comentarios: row.get('comentarios')?.value ?? ''
    }));

    this.draftService.saveDraft(draftData).subscribe({
      next: () => {
        this.messageBox.show(
          'El borrador guardado se cargará automaticamente siempre que navegue al formulario de solicitudes y se elimina una vez enviadas las solicitudes de fondos.',
          'success',
          'Borrador guardado.'
        );
      },
      error: () => {
        this.messageBox.show(
          'Error al guardar el borrador.',
          'error',
          'Error'
        );
      }
    });
  }

  loadDraft(): void {
    this.draftService.getDraft().subscribe({
      next: (draft) => {
        if (draft && draft.draftData) {
          const draftData: DraftRowData[] = JSON.parse(draft.draftData);

          // Clear existing rows
          while (this.rows.length > 0) {
            this.rows.removeAt(0);
          }

          // Load draft data
          draftData.forEach(data => {
            const row = new FormGroup({
              DA: new FormControl(data.DA, Validators.required),
              nroSolicitud: new FormControl(data.nroSolicitud, Validators.required),
              ejercicio: new FormControl(data.ejercicio, Validators.required),
              ordenPago: new FormControl(data.ordenPago, Validators.required),
              concepto: new FormControl(data.concepto, Validators.required),
              vencimiento: new FormControl(data.vencimiento, Validators.required),
              importe: new FormControl(data.importe, Validators.required),
              fuenteFinanciamiento: new FormControl(data.fuenteFinanciamiento, Validators.required),
              cuentaCorriente: new FormControl(data.cuentaCorriente, Validators.required),
              comentarios: new FormControl(data.comentarios, Validators.maxLength(500))
            });
            this.rows.push(row);
          });

          this.updateTableDataSource();
        }
      },
      error: () => {
        // No draft found or error, do nothing
      }
    });
  }


}