import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';
import { TextFieldComponent } from "../text-field/text-field.component";

@Component({
  selector: 'app-form-table',
  templateUrl: './form-table.component.html',
  styleUrl: './form-table.component.scss',
  imports: [MatTableModule, TextFieldComponent]
})
export class FormTableComponent implements AfterViewInit {

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
    'Cuenta Corriente a la cual acreditar'];


  dataSource = Array.from({ length: 10 }, () => ({})); //lord have mercy with this sintax

  ngAfterViewInit(): void {
    this.table.dataSource = this.dataSource;
  }
}
