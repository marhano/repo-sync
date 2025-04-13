import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
  private isBrowser!: boolean;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private router: Router
  ){
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    try{
      const token = await this.sessionService.getSession('token');
      if(token){
        this.gitApiService.token = token;
        this.router.navigate(['/home']);
        return;
      }

      if(this.isBrowser){
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
      }else{
        console.log('Server-side execution, skipping window-based logic');
      }
      
    }catch(error){
      console.log(error);
    }
  }

}
