import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent)
    },
    { 
        path: 'issue', 
        loadComponent: () => import('./pages/issue/issue.component').then(c => c.IssueComponent)     
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent)
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { 
        path: '**', 
        loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent)
    }
];
