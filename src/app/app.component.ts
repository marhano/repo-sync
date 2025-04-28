import { Component } from '@angular/core';
import { GitApiService } from './services/git-api/git-api.service';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from 'ngx-electronyzer';
import { MatDialog } from '@angular/material/dialog';
import { UpdateDialogComponent } from './components/update-dialog/update-dialog.component';
import { UpdateInfo } from './interfaces/update-info.interface';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
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
 
  constructor(
    private electronService: ElectronService,
    private dialog: MatDialog
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
  }
}
