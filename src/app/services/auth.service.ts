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
  constructor(private httpClient : HttpClient, private router: Router) { }

  login(email:string, password:string):Observable<any>{
      console.log("Enviando:", { email, password });
    return this.httpClient.post<any>(this.LOGIN_URL,{email,password}).pipe(
      tap(response => {
        if(response.token){
          console.log(response.token)
        }
      })
    )
  }

  private setToken(token:string):void{
    localStorage.setItem(this.tokenKey,token)
  }

  private getToken():string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticate():boolean{
    const token = this.getToken();
    if(!token){
      return false;
    }else{
      const payload = JSON.parse(token);
      const exp = payload.expiresIn;
      return Date.now() < exp;
    }
  }

  logout():void{
    localStorage.removeItem(this.tokenKey);
    //this.router.navigate("/login");
  }
}
