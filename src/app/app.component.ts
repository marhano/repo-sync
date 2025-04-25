import { Component } from '@angular/core';
import { GitApiService } from './services/git-api/git-api.service';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from 'ngx-electronyzer';
import { UpdateInfo } from 'electron-updater';
import { MatDialog } from '@angular/material/dialog';
import { UpdateDialogComponent } from './components/update-dialog/update-dialog.component';
import { InstallDialogComponent } from './components/install-dialog/install-dialog.component';

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
  updateInfo = {
    "version": "2.0.1",
    "releaseDate": "2025-04-25T12:00:00Z",
    "releaseNotes": "### What's New\n- Improved performance and stability\n- Fixed UI glitches in settings panel\n- Added support for new file formats\n\nFor full details, visit: [GitHub Releases](https://github.com/marhano/repo-sync/releases)",
    "files": [
      {
        "url": "https://github.com/marhano/repo-sync/releases/download/v2.0.1/your-app-setup.exe",
        "size": 51234567,
        "sha512": "abc123..."
      }
    ]
  }
  
  

  constructor(
    private electronService: ElectronService,
    private dialog: MatDialog
  ){
    if(this.electronService.isElectronApp){
      this.electronService.ipcRenderer.on('update-available', (_: any, data: UpdateInfo) => {
        // dialog to display release notes and to download the available updates
        this.dialog.open(UpdateDialogComponent, {
          width: '600px',
          data: data
        });
      });

      this.electronService.ipcRenderer.on('update-downloaded', (_:any) => {
        // dialog to install the updates
        this.dialog.open(InstallDialogComponent, {
          width: '600px',
        });
      });
    }
  }
}
