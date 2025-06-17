import { Routes } from '@angular/router';
import { FormTableComponent } from './components/form-table/form-table.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'form-table', component: FormTableComponent },
    { path: 'home', component: HomeComponent }

];
