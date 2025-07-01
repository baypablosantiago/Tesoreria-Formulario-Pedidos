import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private LOGIN_URL = "http://localhost:5254/login";
  private tokenKey = "authToken";

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
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem("tokenExpiration", expirationTime.toString());
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
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
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(["/"]);
  }

}
