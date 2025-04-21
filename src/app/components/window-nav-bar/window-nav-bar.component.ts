import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../interfaces/user.interface';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-window-nav-bar',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule
  ],
  templateUrl: './window-nav-bar.component.html',
  styleUrl: './window-nav-bar.component.scss'
})
export class WindowNavBarComponent {
  constructor(
    private location: Location,
    private dialog: MatDialog
  ){

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

  ngAfterViewInit(){
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  openSettings(){
    this.dialog.open(SettingsDialogComponent, {
      width: '100%',
      maxWidth: '90vw',
    });

    this.closeAllDialogs();
  }
}
