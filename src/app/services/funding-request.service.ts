import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FundingRequest } from '../models/funding-request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FundingRequestService {
  private apiUrl = 'http://localhost:5254/api/FundingRequest';

  constructor(private http: HttpClient) {}

  addFundingRequest(request: FundingRequest): Observable<FundingRequest> {
    return this.http.post<FundingRequest>(`${this.apiUrl}`, request);
  }
}
