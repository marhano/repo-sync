import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SessionService } from '../../services/session/session.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {
  darkMode = true;

  private sessionService = inject(SessionService);

  async ngOnInit(){
    const mode = await this.sessionService.getSession('darkMode');
    
    this.darkMode = mode;
  }

  onToggle(event: MatSlideToggleChange){
    if(typeof document !== 'undefined'){
      const container = document.querySelector('html') as HTMLElement;
    
      if(event.checked){
        container.classList.add('dark-mode');
      }else{
        container.classList.remove('dark-mode');
      }
    }
    
    this.sessionService.setSession({
      darkMode: event.checked
    });
  } 

  onChange(event: MatSelectChange){
    if(typeof document !== 'undefined'){
      const container = document.querySelector('html') as HTMLElement;

      container.classList.forEach((className) => {
        if (className.includes('palette')) {
          container.classList.remove(className);
        }
      });
  
      container.classList.add(event.value);
    }

    this.sessionService.setSession({
      theme: event.value
    });
  }
}
