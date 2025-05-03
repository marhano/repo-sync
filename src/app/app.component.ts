import { Component } from '@angular/core';
import { GitApiService } from './services/git-api/git-api.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ElectronService } from 'ngx-electronyzer';
import { MatDialog } from '@angular/material/dialog';
import { UpdateDialogComponent } from './components/update-dialog/update-dialog.component';
import { UpdateInfo } from './interfaces/update-info.interface';
import { WindowNavBarComponent } from './components/window-nav-bar/window-nav-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SessionService } from './services/session/session.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    WindowNavBarComponent,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    GitApiService
  ],
  standalone: true,
})
export class AppComponent {
  title = 'repo-sync';
  public showSidebar: boolean = true; 
 
  constructor(
    private electronService: ElectronService,
    private dialog: MatDialog,
    private router: Router,
    private sessionService: SessionService
  ){
    if(this.electronService.isElectronApp){
      this.electronService.ipcRenderer.on('update-available', (_: any, data: any) => {
        // dialog to display release notes and to download the available updates
       
      });

      this.electronService.ipcRenderer.on('update-downloaded', (_:any, data: UpdateInfo) => {
        // dialog to install the updates
        this.dialog.open(UpdateDialogComponent, {
          width: '600px',
          data: data
        });
      });
    }

    this.router.events.subscribe(() => {
      this.toggleSidebar();
    });
  }

  toggleSidebar(){
    const excludedRoutes = ['/login', '/authorize', '/issue'];

    const path = this.router.parseUrl(this.router.url).root.children['primary']?.segments.map(segment => segment.path).join('/');
    this.showSidebar = !excludedRoutes.includes(`/${path}`);
  }

  async ngAfterViewInit(){
    //const user = await this.gitApiService.getAuthUserInformation();
    // Set default repo owner
    this.sessionService.setSession({ owner: 'bastionqa' });
    const mode = await this.sessionService.getSession('darkMode');
    const theme = await this.sessionService.getSession('theme');

    const container = document.querySelector('html') as HTMLElement;

    if(mode){
      container.classList.add('dark-mode');
    }else{
      container.classList.remove('dark-mode');
    }

    if(theme){
      container.classList.forEach((className) => {
        if (className.includes('palette')) {
          container.classList.remove(className);
        }
      });
  
      container.classList.add(theme);
    }
  }
}
