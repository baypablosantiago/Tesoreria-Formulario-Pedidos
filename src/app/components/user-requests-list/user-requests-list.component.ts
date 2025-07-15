import { Component, Input } from '@angular/core';
import { FundingRequest } from '../../models/funding-request';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-user-requests-list',
  imports:[CommonModule,MatCardModule],
  templateUrl: './user-requests-list.component.html',
  styleUrls: ['./user-requests-list.component.scss']
})
export class UserRequestsListComponent {
  @Input() requests: FundingRequest[] = [];
  @Input() showCompleted: boolean = false;

  getRequestStatus(req: FundingRequest): string {
    if (!req.isActive) return 'Aprobada';
    if (req.partialPayment > 0) return 'Pago parcial';
    return 'Pendiente';
  }

  getStatusClass(req: FundingRequest): string {
    if (!req.isActive) return 'completed';
    if (req.partialPayment > 0) return 'partial';
    return 'pending';
  }

  getChipClass(req: FundingRequest): string {
    return `chip ${this.getStatusClass(req)}`;
  }
}