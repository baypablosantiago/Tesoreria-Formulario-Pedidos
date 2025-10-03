import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Notification } from '../models';
import { FundingRequestChangeNotificationDto } from '../models';
import { NotificationSnackbarComponent } from '../components/notification-snackbar/notification-snackbar.component';
import { environment } from '../../environments/environment';

interface AdminNotificationDB {
  id: number;
  adminUserId: string;
  requestId: number;
  requestNumber: number;
  da: number;
  changeType: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  userEmail: string;
  changeDate: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private highlightRequestSubject = new Subject<number>();

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public highlightRequest$ = this.highlightRequestSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  addNotification(data: FundingRequestChangeNotificationDto): Notification {
    const fullMessage = this.buildFullNotificationMessage(data);
    const shortMessage = this.buildShortNotificationMessage(data);
    const icon = this.getIconForChangeType(data.changeType);

    const notification: Notification = {
      id: `${data.requestId}-${Date.now()}`,
      message: fullMessage,
      timestamp: new Date(data.changeDate),
      read: false,
      data
    };

    this.notifications.unshift(notification); // Agregar al inicio

    // Mantener solo las últimas 50 notificaciones
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();

    // Mostrar snackbar con mensaje corto
    this.showSnackbar(shortMessage, icon);

    return notification;
  }

  private showSnackbar(message: string, icon?: string): void {
    this.snackBar.openFromComponent(NotificationSnackbarComponent, {
      data: { message, icon },
      duration: 7000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['custom-notification-snackbar']
    });
  }

  private getIconForChangeType(changeType: string): string {
    switch (changeType) {
      case 'CREATE': return 'add_circle';
      case 'UPDATE': return 'edit';
      case 'STATUS_CHANGE': return 'swap_horiz';
      case 'WORK_STATUS_CHANGE': return 'work';
      case 'COMMENT_ADDED': return 'comment';
      case 'PAYMENT_UPDATED': return 'payments';
      default: return 'notifications';
    }
  }

  loadNotificationsFromDB(): Observable<AdminNotificationDB[]> {
    return this.http.get<AdminNotificationDB[]>(`${environment.apiUrl}/api/AdminNotifications?limit=50`);
  }

  initializeFromDB(dbNotifications: AdminNotificationDB[]): void {
    this.notifications = dbNotifications.map(dbN => this.mapFromDB(dbN));
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  private mapFromDB(dbNotification: AdminNotificationDB): Notification {
    const changeData: FundingRequestChangeNotificationDto = {
      requestId: dbNotification.requestId,
      requestNumber: dbNotification.requestNumber,
      da: dbNotification.da,
      changeType: dbNotification.changeType as any,
      fieldChanged: dbNotification.fieldChanged,
      oldValue: dbNotification.oldValue,
      newValue: dbNotification.newValue,
      changeDate: new Date(dbNotification.changeDate),
      userEmail: dbNotification.userEmail,
      fullRequest: {} as any // No necesario para el drawer
    };

    return {
      id: dbNotification.id.toString(),
      message: this.buildFullNotificationMessage(changeData),
      timestamp: new Date(dbNotification.createdAt),
      read: dbNotification.isRead,
      data: changeData
    };
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount();

      // Actualizar en DB
      this.http.put(`${environment.apiUrl}/api/AdminNotifications/${notificationId}/mark-read`, {})
        .subscribe();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();

    // Actualizar en DB
    this.http.put(`${environment.apiUrl}/api/AdminNotifications/mark-all-read`, {})
      .subscribe();
  }

  highlightRequestById(requestId: number): void {
    this.highlightRequestSubject.next(requestId);
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private buildFullNotificationMessage(data: FundingRequestChangeNotificationDto): string {
    const reqInfo = `Solicitud #${data.requestNumber} de DA ${data.da}`;

    switch (data.changeType) {
      case 'CREATE':
        return `📝 Nueva solicitud recibida: ${reqInfo}`;

      case 'UPDATE':
        return `✏️ ${reqInfo} modificó "${data.fieldChanged}" de "${data.oldValue}" a "${data.newValue}"`;

      case 'STATUS_CHANGE':
        return `🔄 ${reqInfo} cambió estado de "${data.oldValue}" a "${data.newValue}"`;

      case 'WORK_STATUS_CHANGE':
        return `⚙️ ${reqInfo} cambió estado de revisión de "${data.oldValue}" a "${data.newValue}"`;

      case 'COMMENT_ADDED':
        return `💬 ${reqInfo} agregó comentario: "${data.newValue}"`;

      case 'PAYMENT_UPDATED':
        return `💰 ${reqInfo} actualizó pago parcial de ${data.oldValue} a ${data.newValue}`;

      default:
        return `${reqInfo} fue modificada`;
    }
  }

  private buildShortNotificationMessage(data: FundingRequestChangeNotificationDto): string {
    const reqInfo = `Solicitud #${data.requestNumber} de DA ${data.da}`;

    switch (data.changeType) {
      case 'CREATE':
        return `Nueva solicitud recibida: ${reqInfo}`;

      case 'UPDATE':
        return `${reqInfo} modificó "${data.fieldChanged}"`;

      case 'STATUS_CHANGE':
        return `${reqInfo} cambió estado`;

      case 'WORK_STATUS_CHANGE':
        return `${reqInfo} cambió estado de revisión`;

      case 'COMMENT_ADDED':
        return `${reqInfo} agregó comentario`;

      case 'PAYMENT_UPDATED':
        return `${reqInfo} actualizó pago parcial`;

      default:
        return `${reqInfo} fue modificada`;
    }
  }
}
