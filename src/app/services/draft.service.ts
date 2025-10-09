import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DraftFundingRequest, DraftRowData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  private apiUrl = `${environment.apiUrl}/api/Draft`;

  constructor(private http: HttpClient) { }

  getDraft(): Observable<DraftFundingRequest> {
    return this.http.get<DraftFundingRequest>(this.apiUrl);
  }

  saveDraft(draftData: DraftRowData[]): Observable<DraftFundingRequest> {
    return this.http.post<DraftFundingRequest>(this.apiUrl, draftData);
  }

  deleteDraft(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
