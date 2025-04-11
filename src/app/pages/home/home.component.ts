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
    MatMenuModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
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
    private router: Router
  ){}

  async ngOnInit(){
    const response = await this.gitApiService.listRepositories();

    this.repos = response;

    this.filteredRepo.next(this.repos.slice());

    this.repoFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterRepo();
      });

    const savedProject = localStorage.getItem('selectedProject');
    if(savedProject){
      this.selectedProject = savedProject;
      this.dataSource = await this.gitApiService.listRepositoryIssues(savedProject);
      this.assignees = await this.gitApiService.listAssignees(savedProject);
    }
  }

  async ngAfterViewInit(){
    const user = await this.gitApiService.getAuthUserInformation();
  }

  createIssue(): void{
    this.dialog.open(IssueDialogComponent, {
      width: '100%',
      maxWidth: '90vw',
    });
  }

  async onProjectChange(event: MatSelectChange){
    this.selectedProject = event.value;
    console.log("Selected Project: ", this.selectedProject);

    localStorage.setItem('selectedProject', this.selectedProject.full_name);

    const response = await this.gitApiService.listRepositoryIssues(this.selectedProject.full_name);
    console.log(response);

    this.dataSource = response;
    
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
