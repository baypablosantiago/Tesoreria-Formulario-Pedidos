import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserNotificationDrawerComponent } from '../user-notification-drawer/user-notification-drawer.component';
import { RolesService } from '../../services/roles.service';
import { PollingService } from '../../services/polling.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, HasRoleDirective, UserNotificationDrawerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private pollingSubscription?: Subscription;
  private navigationSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private userNotificationService: UserNotificationService,
    private router: Router,
    private rolesService: RolesService,
    private pollingService: PollingService
  ) {}

  ngOnInit(): void {
    if (this.rolesService.hasRole('user')) {

      this.loadNotifications();

      this.pollingSubscription = this.pollingService.tick$.subscribe(() => {
        this.loadNotifications();
      });

      this.navigationSubscription = this.userNotificationService.pendingNavigation$.subscribe(
        (navigation) => {
          if (navigation) {
            this.router.navigate(['/user-requests']);
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private loadNotifications(): void {
    this.userNotificationService.loadNotificationsFromDB().subscribe({
      next: (dbNotifications) => {
        this.userNotificationService.initializeFromDB(dbNotifications);
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
      }
    });
  }
}
