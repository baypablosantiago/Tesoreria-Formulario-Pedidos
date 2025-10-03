import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Notification } from '../models';
import { FundingRequestChangeNotificationDto } from '../models';
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

  constructor() {}

  addNotification(data: FundingRequestChangeNotificationDto): Notification {
    const fullMessage = this.buildFullNotificationMessage(data);

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

    return notification;
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

}
