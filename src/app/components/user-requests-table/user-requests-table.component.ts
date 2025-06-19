import { Component, Input } from '@angular/core';
import { FundingRequest } from '../../models/funding-request';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-user-requests-table',
  imports: [CommonModule,MatCardModule,MatTableModule,MatIconModule,MatButtonModule],
  templateUrl: './user-requests-table.component.html',
  styleUrls: ['./user-requests-table.component.scss']
})
export class UserRequestsTableComponent {
  @Input() title = '';
  @Input() data: FundingRequest[] = [];

  displayedColumns: string[] = [
    'da',
    'requestNumber',
    'fiscalYear',
    'paymentOrderNumber',
    'concept',
    'dueDate',
    'amount',
    'fundingSource',
    'checkingAccount',
    'comments'
  ];
}