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

  getAllActiveFundingRequests(): Observable<FundingRequest[]> {
    return this.http.get<FundingRequest[]>(`${this.apiUrl}/active-requests`);
  }

  getAllInactiveFundingRequests():Observable<FundingRequest[]>{
    return this.http.get<FundingRequest[]>(`${this.apiUrl}/inactive-requests`);
  }

  addPartialPayment(id: number, partialPayment: number): Observable<FundingRequest> {
    return this.http.patch<FundingRequest>(`${this.apiUrl}/partial-payment/${id}`, partialPayment);
  }

  changeIsActive(id: number): Observable<FundingRequest> {
    return this.http.request<FundingRequest>('PATCH', `${this.apiUrl}/is-active/${id}`);
  }

  addComment(id: number, comment:string):Observable<FundingRequest>{
    return this.http.patch<FundingRequest>(`${this.apiUrl}/add-comment/${id}`,{ comment });
  }
}
