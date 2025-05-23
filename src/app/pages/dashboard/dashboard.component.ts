import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GitApiService } from '../../services/git-api/git-api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { SessionService } from '../../services/session/session.service';
import { IssueTrackerService } from '../../services/issue-tracker/issue-tracker.service';
import { CardRepoComponent } from '../../components/card-repo/card-repo.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MarkdownModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTableModule,
    CardRepoComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public repositories: any[] = [];
  public viewedData: any;
  public isLoaded: boolean = false;

  public dataSource: any;
  public displayedColumns: string[] = ['issue_number', 'title', 'author', 'assignee', 'actions'];

  @ViewChild('hoverContainer', { static: false }) hoverContainer!: ElementRef;

  constructor(
    private gitApiService: GitApiService,
    private router: Router,
    private dialog: MatDialog,
    private sessionService: SessionService,
    private issueTrackerService: IssueTrackerService
  ) {
    // Constructor logic here if needed
  }
  
  async ngOnInit() {

    try{
      const response = await this.gitApiService.listRepositories({
        params: {
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member',
          per_page: 5,
          sort: "updated",
        },
        owner: await this.sessionService.getSession('owner')
      });

      console.log(response);

      this.dataSource = await this.gitApiService.listIssuesAssigned({
        owner: await this.sessionService.getSession('owner')
      });

      this.repositories = response;

      this.viewedData = await this.sessionService.getSession('viewed') || [];

      this.repositories.forEach(async element => {
        const read = await this.newIssues(element);

        element.unread = read;
      });
    }catch(error){
      console.error(error);
    }finally{
      this.isLoaded = true;
    }
    
  }

  isViewed(issue: any){
    const url = this.issueTrackerService.extractRepositoryName(issue.url);

    if(this.viewedData &&
      this.viewedData[url.owner] &&
      this.viewedData[url.owner][url.repo]){
        return this.viewedData[url.owner][url.repo].includes(issue.id);
      }

    return false;
  }

  async newIssues(data: any){
    const url = this.issueTrackerService.extractRepositoryName(data.url);
    const issueTrackerData = this.viewedData[url.owner][url.repo] || [];
    
    if(!issueTrackerData){
      return data.open_issues;
    } 

    const issues = await this.gitApiService.listRepositoryIssues(data.full_name);
    const newIssues = issues.filter((issue: any) => !issueTrackerData.includes(issue.id));
    return newIssues.length;
  }

  navigateIssue(data: any){
    this.router.navigate(['/issue'], { queryParams: { url: data.url }});
  }

  async closeIssue(issue: any){

    this.dialog.open(ConfirmationDialogComponent).afterClosed().subscribe(async (result: any) => {
      if(result === 'yes'){
        const response = await this.gitApiService.updateIssue(issue, {
          state: 'closed'
        });

        console.log(response);
      }
    });

    
  }

}
