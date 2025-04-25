import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../environments/environment';
import { SessionService } from '../../services/session/session.service';
import { GitApiService } from '../../services/git-api/git-api.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { WindowNavBarComponent } from '../../components/window-nav-bar/window-nav-bar.component';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    WindowNavBarComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  appVersion: string = environment.APP_VERSION;
  private isBrowser!:boolean;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private sessionService: SessionService,
    private gitApiService: GitApiService,
    private router: Router
  ){
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  async ngOnInit(){
    const token = await this.sessionService.getSession('token');
    if(token){
      this.gitApiService.token = token;
      this.router.navigate(['/home']);
    }
  }

  githubAuth(){
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${environment.CLIENT_ID}&scope=repo,user`;
    if(this.isBrowser){
      window.location.href = authUrl;
    }else{
      console.log('Server-side execution, skipping window-based logic');
    }
    
  }

}