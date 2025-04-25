import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GitApiService } from '../../services/git-api/git-api.service';
import { SessionService } from '../../services/session/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WindowNavBarComponent } from '../../components/window-nav-bar/window-nav-bar.component';
import { ElectronService } from 'ngx-electronyzer';

@Component({
  selector: 'app-authorize',
  imports: [
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    WindowNavBarComponent
  ],
  templateUrl: './authorize.component.html',
  styleUrl: './authorize.component.scss'
})
export class AuthorizeComponent implements OnInit{
  public errorDescription: string | null = '';

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute,
    private electronService: ElectronService
  ){
    
  }

  async ngOnInit(): Promise<void> {
    try{
      const token = await this.sessionService.getSession('token');
      if(token){
        this.gitApiService.token = token;
        this.router.navigate(['/home']);
        return;
      }

      if(this.electronService.isElectronApp){
        this.electronService.ipcRenderer.on('auth-success', async (_: any, token: any) => {
          await this.sessionService.setSession({
            token: token.access_token
          });

          this.gitApiService.token = token;
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        });
      }else{
        this.errorDescription = new URLSearchParams(window.location.search).get('error_description');
        const code = new URLSearchParams(window.location.search).get('code');

        if(code){
          console.log(code);
          const token = await this.gitApiService.requestAccessToken(code);
          await this.sessionService.setSession({
            token: token.access_token
          });
          this.gitApiService.token = token;
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        }
      }

    }catch(error){
      console.log(error);
    }
  }

}
