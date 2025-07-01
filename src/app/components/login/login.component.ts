import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginValid: boolean = true;

  email: string = "";
  password: string = "";

  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
    private router: Router
  ) {}

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.rolesService.getRoles().subscribe({
          next: () => this.router.navigate(['/news']),
          error: () => {
            console.error('No se pudo obtener el rol del usuario.');
            this.loginValid = false;
          }
        });
      },
      error: () => this.loginValid = false
    });
  }
}
