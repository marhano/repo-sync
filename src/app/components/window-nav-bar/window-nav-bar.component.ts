import { Component, Input, Signal, ViewChild, inject, signal } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../interfaces/user.interface';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { SessionService } from '../../services/session/session.service';
import { GitApiService } from '../../services/git-api/git-api.service';
import { FormsModule } from '@angular/forms';
import { ElectronService } from 'ngx-electronyzer';

@Component({
  selector: 'app-window-nav-bar',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './window-nav-bar.component.html',
  styleUrl: './window-nav-bar.component.scss'
})
export class WindowNavBarComponent {
  maximizeIcon = signal('crop_square');
  userProfile!: any;

  @Input() positionFixed: boolean = false;
  @Input() default: boolean = true;

  private sessionService = inject(SessionService);
  private router = inject(Router);
  private gitApiService = inject(GitApiService);
  private electronService = inject(ElectronService);

  constructor(
    private location: Location,
    private dialog: MatDialog
  ){
    try{
      if(this.electronService.isElectronApp){
        this.electronService.ipcRenderer.on('unmaximize-window', () => {
          this.maximizeIcon.set('crop_square');
        });
  
        this.electronService.ipcRenderer.on('maximized-window', () => {
          this.maximizeIcon.set('filter_none');
        });
      }
    }catch(error){
      throw error;
    }
  }

  goBack(){
    this.location.back();
  }

  goForward(){
    this.location.forward();
  }

  showProfileMenu(event: MouseEvent){
    event.stopPropagation();

    const button = (event.target as HTMLElement).parentElement;
    const container = button?.parentElement;

    if(container){
      const profileMenu = container.querySelector('.profile-menu') as HTMLElement;

      if(profileMenu){
        const isVisible = profileMenu.style.display === "block";
        profileMenu.style.display = isVisible ? 'none' : 'block';

        button.classList.toggle('active', !isVisible);
      }
    }
  }

  closeAllDialogs(){
    if(typeof document !== 'undefined'){
      const dialogs = document.querySelectorAll('.profile-menu') as NodeListOf<HTMLElement>;
      const buttons = document.querySelectorAll('.profile-button') as NodeListOf<HTMLElement>;
  
      dialogs.forEach(dialog => dialog.style.display = 'none');
      buttons.forEach(button => button.classList.remove('active'));
    }
  }

  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if(!target.closest('.profile-menu-container')){
      this.closeAllDialogs();
    }
  }

  async ngAfterViewInit(){
    if(typeof document !== 'undefined'){
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    if(this.default){
      this.userProfile = await this.gitApiService.getAuthUserInformation();
    }
  }

  openSettings(){
    this.dialog.open(SettingsDialogComponent, {
      width: '100%',
      maxWidth: '60vw',
    });

    this.closeAllDialogs();
  }

  async signOut(){
    await this.sessionService.removeSession('token');

    this.router.navigate(['/login']);

    this.closeAllDialogs();
  }

  minimizeWindow(){
    if(!this.electronService.isElectronApp){
      console.warn('App not running inside Electron!');
      return;
    }
    this.electronService.ipcRenderer.send('minimize-window');
  }

  maximizeWindow(){
    if(!this.electronService.isElectronApp){
      console.warn('App not running inside Electron!');
      return;
    }
    this.electronService.ipcRenderer.send('maximize-window');
  }

  closeWindow(){
    if(!this.electronService.isElectronApp){
      console.warn('App not running inside Electron!');
      return;
    }
    this.electronService.ipcRenderer.send('close-window');
  }
}
