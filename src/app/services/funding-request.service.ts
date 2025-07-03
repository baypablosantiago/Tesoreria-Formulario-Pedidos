import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FundingRequest } from '../models/funding-request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FundingRequestService {
  private apiUrl = 'http://localhost:5254/api/FundingRequest';

  constructor(private http: HttpClient) { }

  addFundingRequest(request: FundingRequest): Observable<FundingRequest> {
    return this.http.post<FundingRequest>(`${this.apiUrl}`, request);
  }

  getMyFundingRequests(): Observable<FundingRequest[]> {
    return this.http.get<FundingRequest[]>(`${this.apiUrl}/user`);
  }

  getAllFundingRequest(): Observable<FundingRequest[]> {
    return this.http.get<FundingRequest[]>(`${this.apiUrl}/all`);
  }

  addPartialPayment(id: number, partialPayment: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/partial-payment/${id}`, partialPayment);
  }

  changeIsActive(id: number): Observable<FundingRequest> {
    return this.http.request<FundingRequest>('PATCH', `${this.apiUrl}/is-active/${id}`);
  }


}
