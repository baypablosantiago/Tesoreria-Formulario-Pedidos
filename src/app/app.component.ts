import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { filter } from 'rxjs';
import { NgIf } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgIf, MatNativeDateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  showHeader = true;
  hideFooter = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.showHeader = !url.startsWith('/login');

        // Ocultar footer (manteniendo espacio) en las pestañas de admin con mucha información
        this.hideFooter = url.startsWith('/dashboard') || url.startsWith('/finished-requests');
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    sessionStorage.removeItem('authToken');
  }
}
