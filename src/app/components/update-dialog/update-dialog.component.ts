import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UpdateInfo } from 'electron-updater';
import { ElectronService } from 'ngx-electronyzer';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-update-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MarkdownModule,
    MatIconModule
  ],
  templateUrl: './update-dialog.component.html',
  styleUrl: './update-dialog.component.scss'
})
export class UpdateDialogComponent {
  public updateInfo: UpdateInfo = inject(MAT_DIALOG_DATA);
  public releaseNotes: string = this.updateInfo.releaseNotes as string;
  private electronService = inject(ElectronService);

  download(){
    this.electronService.ipcRenderer.send('download-update');
  }
}
