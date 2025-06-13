import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule,MatCardModule,MatInputModule,MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginValid:boolean = true;
  user={
    email:"",
    password:""
  };
  userToTest={
    email:"test@gmail.com",
    password:"pass123"
  };

  validateLogin(email:string, password:string){
    return this.user == this.userToTest;
  }

  login(){
    if(this.validateLogin(this.user.email,this.user.password))
    alert("Login correcto");
  }
}
