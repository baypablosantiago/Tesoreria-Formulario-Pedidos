import { Component, OnInit } from '@angular/core';
import { FundingRequestService } from '../../services/funding-request.service';
import { FundingRequest } from '../../models/funding-request';
import { MonthGroup } from '../../models/month-group';
import { DaCardComponent } from "../da-card/da-card.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-finished-request',
  imports: [DaCardComponent, MatExpansionModule, CommonModule],
  templateUrl: './finished-requests.component.html',
  styleUrls: ['./finished-requests.component.scss']
})
export class FinishedRequestsComponent implements OnInit {
  groupedRequests: MonthGroup[] = [];

  constructor(private fundingRequestService: FundingRequestService) { }

  ngOnInit(): void {
    this.fundingRequestService.getAllInactiveFundingRequests()
      .subscribe(requests => {
        const grouped: { [month: string]: { [da: string]: FundingRequest[] } } = {};

        for (const req of requests) {
          const date = new Date(req.receivedAt!);
          const monthKey = this.formatYearMonth(date);

          if (!grouped[monthKey]) grouped[monthKey] = {};
          if (!grouped[monthKey][req.da]) grouped[monthKey][req.da] = [];

          grouped[monthKey][req.da].push(req);
        }

        this.groupedRequests = Object.entries(grouped).map(([month, daMap]) => ({
          month,
          groupedByDA: Object.entries(daMap).map(([da, requests]) => ({
            da,
            requests
          }))
        }));
      });
  }

  getTotalRequests(monthGroup: MonthGroup): number {
    return monthGroup.groupedByDA.reduce((total, daGroup) => total + daGroup.requests.length, 0);
  }

  formatYearMonth(date: Date): string {
    const month = date.toLocaleString('es-AR', { month: 'long' });
    const year = date.getFullYear();
    return `${year} - ${this.capitalize(month)}`;
  }

  capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

}
