import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
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
import { WindowNavBarComponent } from '../../components/window-nav-bar/window-nav-bar.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { SessionService } from '../../services/session/session.service';
import { CookieService } from 'ngx-cookie-service';

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
    WindowNavBarComponent,
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

  constructor(
    private gitApiService: GitApiService,
    private dialog: MatDialog,
    private router: Router,
    private sessionService: SessionService,
    private cookieService: CookieService
  ){}

  async ngOnInit(){
    const token = await this.sessionService.getSession('token');
    if(token){
      this.gitApiService.token = token;
    }else{
      this.router.navigate(['/login']);
    }

    const response = await this.gitApiService.listRepositories();

    this.repos = response;

    this.filteredRepo.next(this.repos.slice());

    this.repoFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterRepo();
      });

    const savedProject =  this.cookieService.get('selectedProject');
    if(savedProject){
      this.selectedProject = savedProject;
      this.dataSource = await this.gitApiService.listRepositoryIssues(savedProject);
      this.assignees = await this.gitApiService.listAssignees(savedProject);
    }

  }

  async ngAfterViewInit(){
    if(typeof document !== 'undefined'){
       //const user = await this.gitApiService.getAuthUserInformation();
      const mode = await this.sessionService.getSession('darkMode');
      const theme = await this.sessionService.getSession('theme');

      const container = document.querySelector('html') as HTMLElement;

      if(mode){
        container.classList.add('dark-mode');
      }else{
        container.classList.remove('dark-mode');
      }

      if(theme){
        container.classList.forEach((className) => {
          if (className.includes('palette')) {
            container.classList.remove(className);
          }
        });
    
        container.classList.add(theme);
      }
    }
  }

  createIssue(): void{
    this.dialog.open(IssueDialogComponent, {
      width: '100%',
      maxWidth: '90vw',
    });
  }

  async onProjectChange(event: MatSelectChange){
    this.selectedProject = event.value;

    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    this.cookieService.set('selectedProject', this.selectedProject.full_name, { path: '/', expires});

    const response = await this.gitApiService.listRepositoryIssues(this.selectedProject.full_name);

    this.dataSource = response;
    this.assignees = await this.gitApiService.listAssignees(this.selectedProject.full_name);
    
  }

  navigateIssue(data: any){
    const serializedData = JSON.stringify(data);
    this.router.navigate(['/issue'], { queryParams: { data: serializedData }});
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
