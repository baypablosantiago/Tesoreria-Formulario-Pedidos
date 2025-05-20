import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-remove-row-button',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './remove-row-button.component.html',
  styleUrl: './remove-row-button.component.scss'
})
export class RemoveRowButtonComponent {
  @Output() remove = new EventEmitter<void>();

  onRemove() {
    this.remove.emit();
  }

}
