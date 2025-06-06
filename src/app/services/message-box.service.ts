import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageBoxComponent } from '../components/message-box/message-box.component';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {
  constructor(private dialog: MatDialog) {}

  show(message: string, type: MessageType = 'info', title?: string) {
    const defaultTitles: Record<MessageType, string> = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };

    this.dialog.open(MessageBoxComponent, {
      data: {
        message,
        type,
        title: title || defaultTitles[type]
      },
      width: '400px'
    });
  }
}