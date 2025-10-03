import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FundingRequestAdminResponseDto } from '../../models';
import { MatDialog } from '@angular/material/dialog';
import { ActionsModalComponent } from '../actions-modal/actions-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-da-card',
  templateUrl: 'da-card.component.html',
  styleUrls: ['da-card.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DaCardComponent {

  constructor(private dialog: MatDialog) { }

  @Input() requests: FundingRequestAdminResponseDto[] = [];
  @Input() daTitle: string = '';
  @Input() highlightedRequestId: number | null = null;
  displayedColumns = [
    'select',
    'Fecha Recibido',
    'N° de Solicitud',
    // 'Ejercicio',
    'N° de Orden de Pago',
    'Concepto, Proveedor o Contratista',
    'Vencimiento y/o Periodo',
    'Importe Solicitado',
    'Fuente de Financiamiento',
    'Cuenta Corriente a la cual acreditar',
    'Notas / Comentarios',
    'Pago Parcial'
  ];

  onRowClick(row: FundingRequestAdminResponseDto): void {
    const dialogRef = this.dialog.open(ActionsModalComponent, {
      data: row,
      autoFocus: false,
      width: '95vw',
      maxWidth: '95vw',
      height: '600px',
      maxHeight: '600px',
      disableClose: true
    });
  }

  @Output() selectedRequestsChanged = new EventEmitter<FundingRequestAdminResponseDto[]>();

  selection = new SelectionModel<FundingRequestAdminResponseDto>(true, []);

  emitSelected() {
    this.selectedRequestsChanged.emit(this.selection.selected);
  }

  toggleSelection(row: FundingRequestAdminResponseDto) {
    this.selection.toggle(row);
    this.emitSelected();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.requests.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.requests.forEach(row => this.selection.select(row));
      this.emitSelected();
  }


}