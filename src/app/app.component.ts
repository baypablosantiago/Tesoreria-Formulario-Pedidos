import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormTableComponent } from "./components/form-table/form-table.component";
import { SendButtonComponent } from "./components/send-button/send-button.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormTableComponent, SendButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
