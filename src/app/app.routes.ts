import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { IssueComponent } from './pages/issue/issue.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'issue', component: IssueComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];
