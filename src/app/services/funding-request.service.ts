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
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<FundingRequest>(`${this.apiUrl}`, request, { headers });
  }

  getMyFundingRequests(): Observable<FundingRequest[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<FundingRequest[]>(`${this.apiUrl}/user`, { headers });
  }
  
}
