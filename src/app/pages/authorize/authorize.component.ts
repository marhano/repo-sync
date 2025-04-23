import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GitApiService } from '../../services/git-api/git-api.service';
import { SessionService } from '../../services/session/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WindowNavBarComponent } from '../../components/window-nav-bar/window-nav-bar.component';
import { IpcRenderer } from 'electron'; 

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
  private ipc!: IpcRenderer;

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute
  ){
    
  }

  async ngOnInit(): Promise<void> {
    try{
      // this.route?.queryParams.subscribe(async (params) => {
      //   const code = params['code'];
      //   this.errorDescription = params['error_description'];

      //   if(code){
      //     console.log(code);
      //     const token = await this.gitApiService.requestAccessToken(code);
      //     await this.sessionService.setSession({
      //       token: token.access_token
      //     });
      //     this.gitApiService.token = token;
      //     setTimeout(() => {
      //       this.router.navigate(['/home']);
      //     }, 2000);
      //   }
        
      // });

      if((<any>window).require){
        try{
          this.ipc = (<any>window).require('electron').ipcRenderer;
  
          this.ipc.on('auth-success', async (_, token) => {
            await this.sessionService.setSession({
              token: token.access_token
            });
  
            this.gitApiService.token = token;
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          });
        }catch(error){
          throw error;
        }
      }else{
        console.warn('App not running inside Electron!');
      }

      const token = await this.sessionService.getSession('token');
      if(token){
        this.gitApiService.token = token;
        this.router.navigate(['/home']);
        return;
      }

    }catch(error){
      console.log(error);
    }
  }

}
