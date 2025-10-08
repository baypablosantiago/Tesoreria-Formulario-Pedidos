import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { UserNotificationService, UserNotification } from '../../services/user-notification.service';

@Component({
  selector: 'app-user-notification-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './user-notification-drawer.component.html',
  styleUrl: './user-notification-drawer.component.scss'
})
export class UserNotificationDrawerComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: UserNotification[] = [];
  unreadCount = 0;
  shouldShake = false;

  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
  private previousUnreadCount = 0;

  constructor(private userNotificationService: UserNotificationService) {}

  ngOnInit(): void {
    this.notificationsSubscription = this.userNotificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );

    this.unreadCountSubscription = this.userNotificationService.unreadCount$.subscribe(
      count => {
        if (count > this.previousUnreadCount) {
          this.triggerShake();
        }
        this.previousUnreadCount = count;
        this.unreadCount = count;
      }
    );
  }

  ngOnDestroy(): void {
    this.notificationsSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  toggleDrawer(): void {
    this.isOpen = !this.isOpen;
  }

  markAsRead(notification: UserNotification): void {
    this.userNotificationService.markAsRead(notification.id);
  }

  onNotificationClick(notification: UserNotification): void {

    this.markAsRead(notification);

    this.userNotificationService.navigateToRequest(notification.requestId, notification.changeType);

    this.isOpen = false;
  }

  markAllAsRead(): void {
    this.userNotificationService.markAllAsRead();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  }

  private triggerShake(): void {
    this.shouldShake = true;
    setTimeout(() => {
      this.shouldShake = false;
    }, 600);
  }
}
