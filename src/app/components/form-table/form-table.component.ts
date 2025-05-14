import { AfterViewInit, Component, signal, ViewChild } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';
import { TextFieldComponent } from "../text-field/text-field.component";
import { NumberFieldComponent } from "../number-field/number-field.component";
import { MoneyFieldComponent } from "../money-field/money-field.component";
import { SendButtonComponent } from "../send-button/send-button.component";
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-form-table',
  templateUrl: './form-table.component.html',
  styleUrl: './form-table.component.scss',
  imports: [ReactiveFormsModule, JsonPipe ,MatTableModule, TextFieldComponent, NumberFieldComponent, MoneyFieldComponent, SendButtonComponent]
})
export class FormTableComponent implements AfterViewInit {

  form = signal<FormGroup>(
    new FormGroup(
      {
        DA: new FormControl(''),
        nroSolicitud: new FormControl('')
      }
    )
  );

 @ViewChild(MatTable) table!: MatTable<any>;

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
    'Notas / Comentarios'];


  dataSource = Array.from({ length: 6 }, () => ({})); //lord have mercy with this sintax

  ngAfterViewInit(): void {
    this.table.dataSource = this.dataSource;
  }
}
