import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rows-panel',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './rows-panel.component.html',
  styleUrl: './rows-panel.component.scss'
})
export class RowsPanelComponent {
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onAdd() {
    this.add.emit();
  }

  onRemove() {
    this.remove.emit();
  }

}
