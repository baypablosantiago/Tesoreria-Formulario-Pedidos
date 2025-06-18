import { Component, OnInit } from '@angular/core';
import { FundingRequest } from '../../models/funding-request';
import { FundingRequestService } from '../../services/funding-request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-requests',
  imports: [CommonModule],
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
        console.log('Mis solicitudes:', this.myRequests);
      },
      error: err => {
        console.error('Error al cargar solicitudes del usuario:', err);
      }
    });
  }
}