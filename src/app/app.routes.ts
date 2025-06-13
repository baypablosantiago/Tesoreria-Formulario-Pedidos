import { Routes } from '@angular/router';
import { FormTableComponent } from './components/form-table/form-table.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [

{ path: '', component: LoginComponent },
{ path: 'form-table', component: FormTableComponent }

];
