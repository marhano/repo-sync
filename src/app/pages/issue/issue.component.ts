import { Component, OnInit, inject } from '@angular/core';
import { GitApiService } from '../../services/git-api/git-api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MarkdownEditorComponent } from '../../components/markdown-editor/markdown-editor.component';
import { MarkdownModule } from 'ngx-markdown';
import { SessionService } from '../../services/session/session.service';
import { IssueTrackerService } from '../../services/issue-tracker/issue-tracker.service';

@Component({
  selector: 'app-issue',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatMenuModule,
    MarkdownEditorComponent,
    MarkdownModule
  ],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.scss'
})
export class IssueComponent implements OnInit{
  public issue!: any;
  public user: any;
  public editMode: boolean = false;

  private readonly route = inject(ActivatedRoute);

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private issueTrackerService: IssueTrackerService
  ){
    
  }

  async ngOnInit() {
    this.route?.queryParams.subscribe(async (params) => {
      const url = params['url'];
      const issue = await this.gitApiService.sendRequest(url);
      this.issue = issue;

      await this.issueTrackerService.setIssueTrackerDataById(issue);
    });

    this.user = await this.gitApiService.getAuthUserInformation();
  }

  commentEdit(){
    this.editMode = !this.editMode;
  }

}
