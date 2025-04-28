import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ElectronService } from 'ngx-electronyzer';
import { MarkdownModule } from 'ngx-markdown';
import { UpdateInfo } from '../../interfaces/update-info.interface';

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
  private electronService = inject(ElectronService);

  download(){
    this.electronService.ipcRenderer.send('install-update');
  }
}
