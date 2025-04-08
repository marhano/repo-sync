import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { IssueComponent } from './pages/issue/issue.component';

export const routes: Routes = [
    { 
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent)
    },
    { path: 'issue', component: IssueComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: HomeComponent }
];
