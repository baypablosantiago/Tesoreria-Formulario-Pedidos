import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private LOGIN_URL = `${environment.apiUrl}/login`;
  private TOKEN_KEY = "loginToken";

  constructor(private httpClient: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<any> {
  return this.httpClient.post<any>(this.LOGIN_URL, { email, password }).pipe(
    tap(response => {
      if (response.accessToken && response.expiresIn) {
        this.setToken(response.accessToken, response.expiresIn);
      }
    })
  );
}

  private setToken(token: string, expiresIn: number): void {
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem("tokenExpiration", expirationTime.toString());
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiration = localStorage.getItem("tokenExpiration");

    if (!token || !expiration) {
      return false;
    }

    const isValid = Date.now() < Number(expiration);

    if (!isValid) {
      this.logout();
    }

    return isValid;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.clear();
    this.router.navigate(["/"]);
  }

}
