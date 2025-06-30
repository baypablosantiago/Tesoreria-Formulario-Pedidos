import { Component } from '@angular/core';
import { HasRoleDirective } from '../../directives/has-role.directive';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [HasRoleDirective],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {

}
