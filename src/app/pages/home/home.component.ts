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
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})

export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['issue_number', 'title', 'author', 'assignee', 'actions'];
  dataSource: any;
  
  public repoFilterCtrl: FormControl = new FormControl();
  public filteredRepo: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();
  repos!: any[];

  constructor(
    private gitApiService: GitApiService,
    private dialog: MatDialog
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
  }

  createIssue(): void{
    this.dialog.open(IssueDialogComponent, {
      width: '400px',
      data: { message: "Hello dialog!" },
    });
  }

  async onProjectChange(event: MatSelectChange){
    const selectedProject = event.value;
    console.log("Selected Project: ", selectedProject);

    const response = await this.gitApiService.listRepositoryIssues(selectedProject.full_name);
    console.log(response);

    this.dataSource = response;
    
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
