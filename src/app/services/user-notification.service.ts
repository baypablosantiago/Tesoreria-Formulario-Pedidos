import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

interface UserNotificationDB {
  id: number;
  userId: string;
  requestId: number;
  changeType: string;
  data: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  requestId: number;
  changeType: string;
}

export interface NotificationNavigation {
  requestId: number;
  changeType: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private http = inject(HttpClient);
  private notifications: UserNotification[] = [];
  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public pendingNavigation$ = new BehaviorSubject<NotificationNavigation | null>(null);
  private lastCheckTimestamp: Date | null = null;

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {}

  loadNotificationsFromDB(): Observable<UserNotificationDB[]> {

    if (this.lastCheckTimestamp === null) {
      return this.http.get<UserNotificationDB[]>(`${environment.apiUrl}/api/UserNotifications?limit=50`);
    }

    const sinceParam = this.lastCheckTimestamp.toISOString();
    return this.http.get<UserNotificationDB[]>(
      `${environment.apiUrl}/api/UserNotifications?limit=50&since=${sinceParam}`
    );
  }

  initializeFromDB(dbNotifications: UserNotificationDB[]): void {
    if (this.lastCheckTimestamp === null) {
      this.notifications = dbNotifications.map(dbN => this.mapFromDB(dbN));
    } else {

      if (dbNotifications.length > 0) {
        const newNotifications = dbNotifications
          .filter(dbN => !this.notifications.some(n => n.id === dbN.id.toString()))
          .map(dbN => this.mapFromDB(dbN));

        if (newNotifications.length > 0) {
          this.notifications.unshift(...newNotifications);

          if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
          }
        }
      }
    }

    this.lastCheckTimestamp = new Date();

    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  private mapFromDB(dbNotification: UserNotificationDB): UserNotification {
    let parsedData: any = {};

    try {
      parsedData = JSON.parse(dbNotification.data);
    } catch (e) {
      console.error('Error parsing notification data:', e);
    }

    const message = this.buildUserNotificationMessage(dbNotification.changeType, parsedData);

    return {
      id: dbNotification.id.toString(),
      message: message,
      timestamp: new Date(dbNotification.createdAt),
      read: dbNotification.isRead,
      requestId: dbNotification.requestId,
      changeType: dbNotification.changeType
    };
  }

  private buildUserNotificationMessage(changeType: string, data: any): string {
    const requestNumber = data.requestNumber || data.RequestNumber || '?';

    switch (changeType) {
      case 'STATUS_FINALIZED':
        return `Tu solicitud #${requestNumber} ha sido finalizada correctamente. Podrás visualizarla en la pestaña "Historial de Solicitudes".`;

      case 'STATUS_REACTIVATED':
        return `Tu solicitud #${requestNumber} fue devuelta a "Solicitudes en curso".`;

      case 'WORK_STATUS_CHANGE':
        if (data.onWork === true || data.OnWork === true) {
          return `Tu solicitud #${requestNumber} entró en revisión. Ya no podrás modificarla, solo agregar/modificar el campo "Comentarios".`;
        } else {
          return `Tu solicitud #${requestNumber} está pendiente. Podés modificar los campos de la solicitud y agregar comentarios.`;
        }

      case 'COMMENT_ADDED':
        return `Tesorería General agregó un comentario en tu solicitud #${requestNumber}`;

      default:
        return `Tu solicitud #${requestNumber} fue actualizada`;
    }
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {

      const previousState = notification.read;

      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount();

      this.http.put(`${environment.apiUrl}/api/UserNotifications/${notificationId}/mark-read`, {})
        .subscribe({
          error: (err) => {
            console.error('Error al marcar notificación como leída:', err);
            notification.read = previousState;
            this.notificationsSubject.next([...this.notifications]);
            this.updateUnreadCount();
          }
        });
    }
  }

  markAllAsRead(): void {
    const previousStates = this.notifications.map(n => ({ id: n.id, read: n.read }));

    this.notifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();

    this.http.put(`${environment.apiUrl}/api/UserNotifications/mark-all-read`, {})
      .subscribe({
        error: (err) => {
          console.error('Error al marcar todas las notificaciones como leídas:', err);
          this.notifications.forEach(n => {
            const prevState = previousStates.find(ps => ps.id === n.id);
            if (prevState) {
              n.read = prevState.read;
            }
          });
          this.notificationsSubject.next([...this.notifications]);
          this.updateUnreadCount();
        }
      });
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  navigateToRequest(requestId: number, changeType: string): void {
    this.pendingNavigation$.next({ requestId, changeType });
  }
}
