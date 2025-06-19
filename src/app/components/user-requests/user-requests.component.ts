import { Component, OnInit } from '@angular/core';
import { FundingRequest } from '../../models/funding-request';
import { FundingRequestService } from '../../services/funding-request.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-requests',
  imports: [CommonModule,MatCardModule,MatTableModule,MatIconModule,MatButtonModule],
  templateUrl: './user-requests.component.html',
  styleUrl: './user-requests.component.scss'
})
export class UserRequestsComponent implements OnInit {

  myRequests: FundingRequest[] = [];

  constructor(private fundingRequestService: FundingRequestService) {}

  ngOnInit(): void {
    this.fundingRequestService.getMyFundingRequests().subscribe({
      next: requests => {
        this.myRequests = requests;
      },
      error: err => {
        console.error('Error al cargar solicitudes del usuario:', err);
      }
    });
  }

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
  'comments',
  'state'
];

}