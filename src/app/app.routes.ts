import { Routes } from '@angular/router';
import { FormTableComponent } from './components/form-table/form-table.component';
import { LoginComponent } from './components/login/login.component';
import { NewsComponent } from './components/news/news.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { UserRequestsComponent } from './components/user-requests/user-requests.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [AuthenticatedGuard] },
    { path: 'form-table', component: FormTableComponent, canActivate: [AuthGuard] },
    { path: 'user-requests', component: UserRequestsComponent, canActivate: [AuthGuard] },
    { path: 'news', component: NewsComponent, canActivate: [AuthGuard] },
    { path: 'all-requests', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'login' }
];
