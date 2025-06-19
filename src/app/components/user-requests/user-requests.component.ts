import { Component, OnInit } from '@angular/core';
import { FundingRequest } from '../../models/funding-request';
import { FundingRequestService } from '../../services/funding-request.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserRequestsTableComponent } from '../user-requests-table/user-requests-table.component';

@Component({
  selector: 'app-user-requests',
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule,UserRequestsTableComponent],
  templateUrl: './user-requests.component.html',
  styleUrl: './user-requests.component.scss'
})
export class UserRequestsComponent implements OnInit {

  myRequests: FundingRequest[] = [];

  constructor(private fundingRequestService: FundingRequestService) { }

  activeRequests: FundingRequest[] = [];
  inactiveRequests: FundingRequest[] = [];

  ngOnInit(): void {
    this.fundingRequestService.getMyFundingRequests().subscribe({
      next: requests => {
        this.myRequests = requests;

        // Separar en activos e inactivos
        this.activeRequests = this.myRequests.filter(r => r.isActive);
        this.inactiveRequests = this.myRequests.filter(r => !r.isActive);
      },
      error: err => {
        console.error('Error al cargar solicitudes del usuario:', err);
      }
    });
  }
}