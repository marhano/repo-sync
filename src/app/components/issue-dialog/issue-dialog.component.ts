import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'; 
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { GitApiService } from '../../services/git-api/git-api.service';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectDialogComponent } from '../select-dialog/select-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-issue-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MarkdownModule,
    CommonModule,
    FormsModule,
    MarkdownEditorComponent,
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatCheckboxModule,
    SelectDialogComponent,
    MatTooltipModule
  ],
  templateUrl: './issue-dialog.component.html',
  styleUrl: './issue-dialog.component.scss'
})
export class IssueDialogComponent{
  private readonly gitApiService = inject(GitApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<IssueDialogComponent>);

  public repoFilterCtrl: FormControl = new FormControl();
  public filteredRepo: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  repos!: any[];
  protected _onDestroy = new Subject<void>();
  selectedProject: any;

  assignees: any;
  labels: any;

  selectedAssignees: any[] = [];
  selectedLabels: any[] = [];

  form!: FormGroup

  async ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      markdownContent: ['']
    });
    this.repos = await this.gitApiService.listRepositories();

    this.filteredRepo.next(this.repos.slice());

    this.repoFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterRepo();
      });
  }

  get markdownContent(): FormControl{
    return this.form.get('markdownContent') as FormControl;
  }

  async onProjectChange(event: MatSelectChange){
    this.assignees = await this.gitApiService.listAssignees(event.value.full_name);
    this.labels = await this.gitApiService.listLabels(event.value.full_name);

    console.log(this.labels);

    this.selectedProject = event.value.full_name;
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

  updateSelectedAssignees(selected: any[]){
    console.log(selected);

    this.selectedAssignees = selected;
  }

  updateSelectedLabels(selected: any[]){
    this.selectedLabels = selected;
  }

  getColors(color: string): { backgroundColor: string; textColor: string } {
    // Extract RGB components from hex color
    const red = parseInt(color.substr(0, 2), 16) || 0;
    const green = parseInt(color.substr(2, 2), 16) || 0;
    const blue = parseInt(color.substr(4, 2), 16) || 0;

    // Generate semi-transparent background color (with alpha value of 0.18 for 30% opacity)
    const backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.18)`;

    // Generate a lighter text color (increase brightness while keeping hue)
    const lighten = (value: number) => Math.min(value + 60, 255); // Increase brightness but cap at 255
    const textColor = `#${lighten(red).toString(16).padStart(2, '0')}${lighten(green).toString(16).padStart(2, '0')}${lighten(blue).toString(16).padStart(2, '0')}`;

    return { backgroundColor, textColor };
  }

  async createIssue(){
    if(!this.form.valid){
      return;
    }

    const data = {
      title: this.form.get('title')?.value,
      body: this.form.get('markdownContent')?.value,
      assignees: this.selectedAssignees.map(assignee => assignee.login),
      labels: this.selectedLabels.map(label => label.name),
      type: null
    };

    const response = await this.gitApiService.createIssue(this.selectedProject, data);

    if(response.status === 200){
      this.dialogRef.close();
    }
  }

}
