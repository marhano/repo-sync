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

@Component({
  selector: 'app-projects',
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatButtonToggleModule,
    MarkdownModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit{
  public repositories: any;
  public selectedRepo: any;

  constructor(
    private gitApiService: GitApiService,
    private sessionService: SessionService,
    private issueTrackerService: IssueTrackerService
  ){}

  async ngOnInit() {
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

  async open(event: any, repo: any){
    const readme: any = await this.gitApiService.getRepositoryReadme(repo.full_name);
    repo.readme = readme.content ? atob(readme.content) : null;
    this.selectedRepo = repo;

    const repositoryContainer = document.querySelector('.repository-container') as HTMLElement;
    const card = event.target as HTMLElement;
    const cards = document.querySelectorAll('.card');
    const sidebard = document.querySelector('.sidebar') as HTMLElement;
    const sticky = document.querySelector('.sticky') as HTMLElement;

    cards.forEach((element) => {
      const cardElement = element as HTMLElement;
      if(cardElement.style.order === '-1'){
        cardElement.style.order = '0';
      }

      if(cardElement.classList.contains('selected')){
        cardElement.classList.remove('selected');
      }

      if(cardElement.classList.contains('focus')){
        cardElement.classList.remove('focus');
      }
    });


    sidebard.style.minWidth = '0px';
    sidebard.style.width = '0px';
    card.style.order = '-1';
    card.classList.add('selected');
    repositoryContainer.style.transform = 'translateX(0px)';

    this.showOverlay();

    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    setTimeout(() => {
      sticky.style.height = '0px';
      sticky.style.transform = 'translateY(-500px)';
      sticky.style.padding = '0px';

      const cardRect = card.getBoundingClientRect();
      const containerLeft = cardRect.right;
      repositoryContainer.style.left = `${containerLeft + 16}px`;
    }, 200);
    
  }

  showOverlay() {
    // Check if an overlay already exists
    let overlay = document.querySelector('.overlay') as HTMLElement;

    if (!overlay) {
      // Create the overlay element
      overlay = document.createElement('div');
      overlay.classList.add('overlay');
      document.body.appendChild(overlay);
    }
  
    // Display the overlay
    overlay.style.display = 'block';
  
    // Add a click event to close the overlay
    overlay.onclick = () => {
      this.hideOverlay()
     
    };
  }

  close(){
    this.hideOverlay();
  }

  hideOverlay(){
    const card = document.querySelector('.card.selected') as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;
    const sidebard = document.querySelector('.sidebar') as HTMLElement;
    const sticky = document.querySelector('.sticky') as HTMLElement;
    const repositoryContainer = document.querySelector('.repository-container') as HTMLElement;

    overlay.style.display = 'none';
    card.classList.remove('selected');
    card.style.order = '0';
    sidebard.style.minWidth = '250px';
    repositoryContainer.style.transform = 'translateX(1200px)';

    setTimeout(() => {      
      card.scrollIntoView({ behavior: 'instant', block: 'center' });
      card.classList.add('focus');

      sticky.style.height = 'initial';
      sticky.style.transform = 'translateY(0px)';
      sticky.style.padding = '0 0 24px';
    }, 200);
  }
  
}
