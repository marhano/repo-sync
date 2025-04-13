import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../environments/environment';
import { SessionService } from '../../services/session/session.service';
import { GitApiService } from '../../services/git-api/git-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  appVersion: string = environment.APP_VERSION;

  constructor(
    private sessionService: SessionService,
    private gitApiService: GitApiService,
    private router: Router
  ){

  }
  ngOnInit(){
    console.log('on');
    const token = this.sessionService.getSession('token');
    if(token){
      this.gitApiService.token = token;
      console.log('__token ',token);
      this.router.navigate(['/home']);
    }
  }

  githubAuth(){
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${environment.GIT_CLIENT_ID}&scope=repo,user`;
    window.location.href = authUrl;
  }

}