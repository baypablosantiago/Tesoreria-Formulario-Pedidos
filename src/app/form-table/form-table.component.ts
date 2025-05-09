import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableModule, MatTable } from '@angular/material/table';
import { FormTableDataSource, FormTableItem } from './form-table-datasource';

@Component({
  selector: 'app-form-table',
  templateUrl: './form-table.component.html',
  styleUrl: './form-table.component.scss',
  imports: [MatTableModule]
})
export class FormTableComponent implements AfterViewInit {

  @ViewChild(MatTable) table!: MatTable<FormTableItem>;
  dataSource = new FormTableDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
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

  ngAfterViewInit(): void {
    this.table.dataSource = this.dataSource;
  }
}
