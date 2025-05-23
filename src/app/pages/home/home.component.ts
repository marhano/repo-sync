import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { GitApiService } from '../../services/git-api/git-api.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'; 
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { IssueDialogComponent } from '../../components/issue-dialog/issue-dialog.component';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { SessionService } from '../../services/session/session.service';
import { CookieService } from 'ngx-cookie-service';
import { IssueTrackerService } from '../../services/issue-tracker/issue-tracker.service';

export interface Issue {
  issueNumber: number;
  title: string;
  author: string;
  assignee: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatMenuModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [
    CookieService
  ]
})

export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['issue_number', 'title', 'author', 'assignee', 'actions'];
  dataSource: any;
  selectedProject: any;
  assignees: any;
  
  public repoFilterCtrl: FormControl = new FormControl();
  public filteredRepo: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();
  repos!: any[];
  public viewedData: any;

  public isLoaded: boolean = false;

  constructor(
    private gitApiService: GitApiService,
    private dialog: MatDialog,
    private router: Router,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private issueTrackerService: IssueTrackerService
  ){}

  async ngOnInit(){
    try{
      const token = await this.sessionService.getSession('token');
      if(token){
        this.gitApiService.token = token;
      }else{
        this.router.navigate(['/login']);
      }

      const response = await this.gitApiService.listRepositories({
        params: {
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member',
          per_page: 100,
        },
        owner: await this.sessionService.getSession('owner')
      });

      this.repos = response;

      this.filteredRepo.next(this.repos.slice());

      this.repoFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterRepo();
        });

      const savedProject = await this.sessionService.getSession('selectedProject');
      if(savedProject){
        this.selectedProject = savedProject;
        this.dataSource = await this.gitApiService.listRepositoryIssues(savedProject);
        this.assignees = await this.gitApiService.listAssignees(savedProject);
      }

      this.viewedData = await this.sessionService.getSession('viewed') || [];
    }catch(error) {
      console.error(error);
    }finally{
      this.isLoaded = true;
    }
    
  }

  async ngAfterViewInit(){
  }

  createIssue(): void{
    this.dialog.open(IssueDialogComponent, {
      width: '100%',
      maxWidth: '90vw',
    });
  }

  async onProjectChange(event: MatSelectChange){
    this.selectedProject = event.value;

    await this.sessionService.setSession({
      selectedProject: this.selectedProject.full_name
    });

    const response = await this.gitApiService.listRepositoryIssues(this.selectedProject.full_name);

    this.dataSource = response;
    this.assignees = await this.gitApiService.listAssignees(this.selectedProject.full_name);
    
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

  navigateIssue(data: any){
    this.router.navigate(['/issue'], { queryParams: { url: data.url }});
  }

  protected filterRepo() {
    if (!this.repos) {
      return;
    }
    // get the search keyword
    let search = this.repoFilterCtrl.value;
    if (!search) {
      this.filteredRepo.next(this.repos.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredRepo.next(
      this.repos.filter((bank: any) => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }

}
