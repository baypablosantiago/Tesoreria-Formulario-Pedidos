import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-send-button',
  templateUrl: 'send-button.component.html',
  styleUrl: 'send-button.component.scss',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
})
export class SendButtonComponent {


}