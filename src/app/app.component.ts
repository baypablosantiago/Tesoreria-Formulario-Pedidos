import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormTableComponent } from "./components/form-table/form-table.component";
import { LoginComponent } from "./components/login/login.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormTableComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
