import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { MessageBoxService } from './message-box.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private LOGIN_URL = `${environment.apiUrl}/login`;
  private TOKEN_KEY = "loginToken";
  private tokenExpirationTimer?: any;

  constructor(
    private httpClient: HttpClient, 
    private router: Router,
    private messageBoxService: MessageBoxService
  ) { }

  login(email: string, password: string): Observable<any> {
  return this.httpClient.post<any>(this.LOGIN_URL, { email, password }).pipe(
    tap(response => {
      if (response.accessToken && response.expiresIn) {
        this.setToken(response.accessToken, response.expiresIn);
        this.startTokenExpirationTimer();
      }
    })
  );
}

  private setToken(token: string, expiresIn: number): void {
    const expirationTime = Date.now() + expiresIn * 1000;
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem("tokenExpiration", expirationTime.toString());
  }

  private getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiration = sessionStorage.getItem("tokenExpiration");

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
    this.clearTokenExpirationTimer();
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.clear();
    this.router.navigate(["/"]);
  }

  private startTokenExpirationTimer(): void {
    this.clearTokenExpirationTimer();
    
    const expiration = sessionStorage.getItem("tokenExpiration");
    if (!expiration) return;
    
    const timeUntilExpiration = Number(expiration) - Date.now();
    
    if (timeUntilExpiration > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.showExpirationWarning();
      }, timeUntilExpiration);
    }
  }

  private clearTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = undefined;
    }
  }

  private showExpirationWarning(): void {
    this.messageBoxService.show(
      'Tu sesión ha expirado. Redirigiendo al login...',
      'warning',
      'Sesión Expirada'
    );
    
    // Dar un pequeño delay para que el usuario vea el mensaje antes del redirect
    setTimeout(() => {
      this.logout();
    }, 3000);
  }

}
