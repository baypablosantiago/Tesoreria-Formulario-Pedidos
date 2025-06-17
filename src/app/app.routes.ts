import { Routes } from '@angular/router';
import { FormTableComponent } from './components/form-table/form-table.component';
import { LoginComponent } from './components/login/login.component';
import { NewsComponent } from './components/news/news.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'form-table', component: FormTableComponent, canActivate: [authGuard] },
    { path: 'news', component: NewsComponent, canActivate: [authGuard] }

];
