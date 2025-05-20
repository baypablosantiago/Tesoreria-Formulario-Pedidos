import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MessageBoxService } from '../../services/message-box.service';

@Component({
  selector: 'app-send-button',
  templateUrl: 'send-button.component.html',
  styleUrl: 'send-button.component.scss',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
})
export class SendButtonComponent {
  @Output() send = new EventEmitter<void>();

  private readonly messageBox = inject(MessageBoxService);

  onClick(): void {
    this.send.emit();
    this.messageBox.show('El formulario fue enviado con exito.', 'success', 'Formulario enviado.');
  }
}
