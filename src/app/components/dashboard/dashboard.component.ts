import { Component } from '@angular/core';
import { DaCardComponent } from "../da-card/da-card.component";
import { CommonModule } from '@angular/common';
import { FundingRequest } from '../../models/funding-request';
import { FundingRequestService } from '../../services/funding-request.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [DaCardComponent,CommonModule]
})
export class DashboardComponent {

  constructor(private fundingService : FundingRequestService) { }

  allRequests: FundingRequest[] = []

  ngOnInit(){
    this.fundingService.getAllActiveFundingRequests().subscribe(
    (requests) => { 
      this.allRequests = requests;
      this.groupedRequests = this.groupByDA(requests);
    }
    );
  }

  groupedRequests: { da: number; requests: FundingRequest[] }[] = [];

  private groupByDA(requests: FundingRequest[]) {
    const grouped: { [da: number]: FundingRequest[] } = {};

    for (const req of requests) {
      if (!grouped[req.da]) {
        grouped[req.da] = [];
      }
      grouped[req.da].push(req);
    }

    return Object.entries(grouped).map(([da, reqs]) => ({
      da: +da,
      requests: reqs
    }));
  }
}