import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ElectronService } from 'ngx-electronyzer';

@Component({
  selector: 'app-install-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './install-dialog.component.html',
  styleUrl: './install-dialog.component.scss'
})
export class InstallDialogComponent {
  private electronService = inject(ElectronService);

  restartNow(){
    this.electronService.ipcRenderer.send('install-update');
  }
}
