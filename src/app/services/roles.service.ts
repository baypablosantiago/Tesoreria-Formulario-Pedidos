import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private LOGIN_URL = `${environment.apiUrl}/roles`;
  private ROLE_KEY = 'role';

  constructor(private httpClient: HttpClient) { }

  getRoles(): Observable<any> {
    return this.httpClient.get<any>(this.LOGIN_URL).pipe(
      tap(response => {
        this.setRole(response.role);
      })
    );
  }

  setRole(role: string): void {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  hasRole(role: string): boolean {
    return this.getRole() === role;
  }
}
