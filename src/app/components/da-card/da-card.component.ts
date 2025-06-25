import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { FundingRequest } from '../../models/FundingRequest';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-da-card',
  templateUrl: 'da-card.component.html',
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

@Input() requests: FundingRequest[] = [];

@Input() daTitle: string = '';
displayedColumns = [
    'N° de Solicitud',
    'Ejercicio',
    'N° de Orden de Pago',
    'Concepto, Proveedor o Contratista',
    'Vencimiento y/o Periodo',
    'Importe Solicitado',
    'Fuente de Financiamiento',
    'Cuenta Corriente a la cual acreditar',
    'Notas / Comentarios',
    'Acciones'
  ];


}