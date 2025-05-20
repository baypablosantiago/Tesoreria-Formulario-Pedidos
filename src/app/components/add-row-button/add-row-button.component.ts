import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-row-button',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './add-row-button.component.html',
  styleUrl: './add-row-button.component.scss'
})
export class AddRowButtonComponent {

  @Output() add = new EventEmitter<void>();

  onAdd() {
    this.add.emit();
  }

}
