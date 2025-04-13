import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GitApiService } from '../../services/git-api/git-api.service';
import { SessionService } from '../../services/session/session.service';
import { Router } from '@angular/router';

declare const window: any;

@Component({
  selector: 'app-authorize',
  imports: [
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './authorize.component.html',
  styleUrl: './authorize.component.scss'
})
export class AuthorizeComponent implements OnInit{
  public errorDescription: string | null = '';

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private router: Router
  ){}

  async ngOnInit(): Promise<void> {
    try{
      this.errorDescription = new URLSearchParams(window.location.search).get('error_description');
      const code = new URLSearchParams(window.location.search).get('code');
      if(code){
        const token = await this.gitApiService.requestAccessToken(code);
        this.sessionService.setSession({
          token: token.access_token
        });
        this.gitApiService.token = token;
        this.router.navigate(['/home']);
      }
    }catch(error){
      console.log(error);
    }
  }

}
