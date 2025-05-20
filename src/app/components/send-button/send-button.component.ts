import {Component, EventEmitter, inject, Output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MessageBoxComponent } from '../message-box/message-box.component';

@Component({
  selector: 'app-send-button',
  templateUrl: 'send-button.component.html',
  styleUrl: 'send-button.component.scss',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
})
export class SendButtonComponent {
 @Output() send = new EventEmitter<void>();

  onClick() {
    this.send.emit();
    this.openDialog();
  }

  readonly dialog = inject(MatDialog);

  openDialog():void{
    this.dialog.open(MessageBoxComponent);
  }

}