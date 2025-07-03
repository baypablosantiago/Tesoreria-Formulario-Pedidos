import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FundingRequest } from '../../models/funding-request';
import { MatDialog } from '@angular/material/dialog';
import { ActionsModalComponent } from '../actions-modal/actions-modal.component';

@Component({
  selector: 'app-da-card',
  templateUrl: 'da-card.component.html',
  styleUrls: ['da-card.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DaCardComponent {

  constructor(private dialog: MatDialog) { }

  @Input() requests: FundingRequest[] = [];

  @Input() daTitle: string = '';
  displayedColumns = [
    'N° de Solicitud',
    'Ejercicio',
    'Fecha Recibido',
    'N° de Orden de Pago',
    'Concepto, Proveedor o Contratista',
    'Vencimiento y/o Periodo',
    'Importe Solicitado',
    'Fuente de Financiamiento',
    'Cuenta Corriente a la cual acreditar',
    'Notas / Comentarios',
    'Pago Parcial'
  ];

  onRowClick(row: FundingRequest): void {
    this.dialog.open(ActionsModalComponent, {
      data: row,
      width: '90vw',         
      maxWidth: '90vw',      
      disableClose: true
    });
  }
}