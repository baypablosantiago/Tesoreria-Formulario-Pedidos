import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FundingRequestCreateDto,
  FundingRequestResponseDto,
  FundingRequestAdminResponseDto,
  FundingRequestUpdateDto,
  PartialPaymentUpdateDto,
  CommentsFromTesoDto,
  PartialPayment
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class FundingRequestService {
  private apiUrl = `${environment.apiUrl}/api/FundingRequest`;
  private partialPaymentApiUrl = `${environment.apiUrl}/api/PartialPayment`;

  constructor(private http: HttpClient) { }

  addFundingRequest(request: FundingRequestCreateDto): Observable<FundingRequestResponseDto> {
    return this.http.post<FundingRequestResponseDto>(`${this.apiUrl}`, request);
  }

  getMyFundingRequests(): Observable<FundingRequestResponseDto[]> {
    return this.http.get<FundingRequestResponseDto[]>(`${this.apiUrl}/user`);
  }

  getAllActiveFundingRequests(): Observable<FundingRequestAdminResponseDto[]> {
    return this.http.get<FundingRequestAdminResponseDto[]>(`${this.apiUrl}/active-requests`);
  }

  getAllInactiveFundingRequests(): Observable<FundingRequestAdminResponseDto[]> {
    return this.http.get<FundingRequestAdminResponseDto[]>(`${this.apiUrl}/inactive-requests`);
  }

  addPartialPayment(id: number, dto: PartialPaymentUpdateDto): Observable<FundingRequestResponseDto> {
    return this.http.patch<FundingRequestResponseDto>(`${this.apiUrl}/partial-payment/${id}`, dto);
  }

  changeIsActive(id: number): Observable<FundingRequestResponseDto> {
    return this.http.request<FundingRequestResponseDto>('PATCH', `${this.apiUrl}/is-active/${id}`);
  }

  addComment(id: number, dto: CommentsFromTesoDto): Observable<FundingRequestResponseDto> {
    return this.http.patch<FundingRequestResponseDto>(`${this.apiUrl}/add-comment/${id}`, dto);
  }

  updateFundingRequest(request: FundingRequestUpdateDto): Observable<FundingRequestResponseDto> {
    return this.http.put<FundingRequestResponseDto>(`${this.apiUrl}/update-request`, request);
  }

  changeOnWork(id: number): Observable<FundingRequestResponseDto> {
    return this.http.request<FundingRequestResponseDto>('PATCH', `${this.apiUrl}/on-work/${id}`);
  }

  setOnWorkBatch(requestIds: number[], onWork: boolean): Observable<{ updatedCount: number; message: string }> {
    return this.http.post<{ updatedCount: number; message: string }>(`${this.apiUrl}/batch/set-onwork`, {
      requestIds,
      onWork
    });
  }

  getPartialPaymentHistory(fundingRequestId: number): Observable<PartialPayment[]> {
    return this.http.get<PartialPayment[]>(`${this.partialPaymentApiUrl}/${fundingRequestId}/history`);
  }

  getTotalPartialPayment(fundingRequestId: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.partialPaymentApiUrl}/${fundingRequestId}/total`);
  }

  deletePartialPayment(paymentId: number): Observable<any> {
    return this.http.delete(`${this.partialPaymentApiUrl}/${paymentId}`);
  }
}
