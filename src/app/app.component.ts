import { Component } from '@angular/core';
import { HomeComponent } from './pages/home/home.component';
import { GitApiService } from './services/git-api/git-api.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    HomeComponent,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    GitApiService
  ],
  standalone: true
})
export class AppComponent {
  title = 'repo-sync';
}
