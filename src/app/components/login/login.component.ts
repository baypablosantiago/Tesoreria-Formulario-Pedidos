import { Component, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnDestroy {

  loginValid: boolean = true;

  email: string = "";
  password: string = "";
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
    private router: Router
  ) {}

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Pequeño delay para asegurar que el token esté disponible
        setTimeout(() => {
          this.rolesService.getRoles().subscribe({
            next: () => this.router.navigate(['/news']),
            error: () => {
              this.loginValid = false;
            }
          });
        }, 100);
      },
      error: () => this.loginValid = false
    });
  }
  
  currentYear: number = 0;

  ngOnInit() {
    this.currentYear = new Date().getFullYear(); // Asigna el año actual al inicializar
    // Ocultar scrollbars del body en login
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Restaurar scrollbars del body al salir del login
    document.body.style.overflow = 'auto';
  }

}
