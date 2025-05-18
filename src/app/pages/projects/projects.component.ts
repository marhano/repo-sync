import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GitApiService } from '../../services/git-api/git-api.service';
import { SessionService } from '../../services/session/session.service';
import { IssueTrackerService } from '../../services/issue-tracker/issue-tracker.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MarkdownModule } from 'ngx-markdown';
import { CardRepoComponent } from '../../components/card-repo/card-repo.component';

@Component({
  selector: 'app-projects',
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatButtonToggleModule,
    MarkdownModule,
    CardRepoComponent
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit{
  public repositories: any;
  public selectedRepo: any;
  public isLoaded: boolean = false;

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private issueTrackerService: IssueTrackerService
  ){}

  async ngOnInit() {
    try{
      this.repositories = await this.gitApiService.listRepositories({
        params: {
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member',
          per_page: 100,
        },
        owner: await this.sessionService.getSession('owner')
      });

      this.repositories.forEach(async (element: any) => {
        const read = await this.newIssues(element);

        element.unread = read;
      });
    }catch(error){
      console.error(error);
    }finally{
      this.isLoaded = true;
    } 
  }

  async newIssues(data: any){
    const url = this.issueTrackerService.extractRepositoryName(data.url);
    const viewedData = await this.sessionService.getSession('viewed') || [];
    const issueTrackerData = viewedData[url.owner][url.repo] || [];

    if(!issueTrackerData){
      return data.open_issues;
    } 

    const issues = await this.gitApiService.listRepositoryIssues(data.full_name);
    const newIssues = issues.filter((issue: any) => !issueTrackerData.includes(issue.id));
    return newIssues.length;
  }
  
}
