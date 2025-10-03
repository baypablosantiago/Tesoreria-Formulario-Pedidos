import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  icon?: string;
}

@Component({
  selector: 'app-notification-snackbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './notification-snackbar.component.html',
  styleUrl: './notification-snackbar.component.scss'
})
export class NotificationSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
    public snackBarRef: MatSnackBarRef<NotificationSnackbarComponent>
  ) {}

  close(): void {
    this.snackBarRef.dismiss();
  }
}
