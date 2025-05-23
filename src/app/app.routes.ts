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
    {
        path: 'authorize',
        loadComponent: () => import('./pages/authorize/authorize.component').then(c => c.AuthorizeComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent)
    },
    {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects.component').then(c => c.ProjectsComponent)
    },
    {
        path: 'api-docs/:id',
        loadComponent: () => import('./pages/api-docs/api-docs.component').then(c => c.ApiDocsComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { 
        path: '**', 
        loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent)
    }
];
