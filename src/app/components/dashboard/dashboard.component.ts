import { Component } from '@angular/core';
import { DaCardComponent } from "../da-card/da-card.component";
import { CommonModule } from '@angular/common';
import { FundingRequest } from '../../models/funding-request';
import { FundingRequestService } from '../../services/funding-request.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [DaCardComponent, CommonModule, MatButtonModule]
})
export class DashboardComponent {
  constructor(private fundingService: FundingRequestService,private router: Router) { }

  allRequests: FundingRequest[] = []

  ngOnInit() {
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

  private reloadCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  changeIsActiveState() {
    this.reloadCurrentRoute();
  }

  generateExcel() {
    alert("Aca se va a generar un excel");
  }

}