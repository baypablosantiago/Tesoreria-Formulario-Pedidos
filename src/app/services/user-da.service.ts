import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserDaService {

  constructor(private http: HttpClient) { }

  getUserDAs(): Observable<number[]> {
    return this.http.get<number[]>(`${environment.apiUrl}/api/userda`);
  }
}