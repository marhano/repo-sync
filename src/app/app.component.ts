import { Component, inject, resource } from '@angular/core';
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
import { environment } from '../environments/environment';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    WindowNavBarComponent,
    MatIconModule,
    CommonModule,
    FontAwesomeModule
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
  public appVersion = environment.APP_VERSION;

  private gitApiService = inject(GitApiService);
  
  docsResource = resource({
    loader: () => this.gitApiService.getApiDocs()
  });
 
  constructor(
    private electronService: ElectronService,
    private dialog: MatDialog,
    private router: Router,
    private sessionService: SessionService,
    private library: FaIconLibrary
  ){

    library.addIconPacks(fas, far);

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

  transformItemName(item: string): string {
    return item
      .replace('.json', '') // Remove the .json extension
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  }

  async ngAfterViewInit(){

    //const user = await this.gitApiService.getAuthUserInformation();
    // Set default repo owner
    this.sessionService.setSession({ owner: 'marhano' });
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
