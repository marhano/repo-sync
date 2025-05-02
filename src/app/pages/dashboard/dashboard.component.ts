import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GitApiService } from '../../services/git-api/git-api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MarkdownModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public repositories: any[] = [];
  public isHovered: boolean = false;
  public mouseX: number = 0;
  public mouseY: number = 0;
  public readme: any;
  public hoverDirection: string = 'right'; 
  public isLoading: boolean = true;
  public containerWidth: number = 0;

  @ViewChild('hoverContainer', { static: false }) hoverContainer!: ElementRef;

  constructor(
    private gitApiService: GitApiService,
  ) {
    // Constructor logic here if needed
  }
  
  async ngOnInit() {
    const response = await this.gitApiService.listRepositories({
      visibility: 'all',
      affiliation: 'owner,collaborator,organization_member',
      per_page: 5,
      sort: "updated",
    });

    this.repositories = response;
  }

  async onMouseEnter(item: any){
    this.isHovered = true;
    this.isLoading = true;

    try{
      const response: any = await this.gitApiService.getRepositoryReadme(item.full_name);
      this.readme = response.content ? atob(response.content) : null;
    }catch(error){
      console.error('Error fetching README:', error);
      this.readme = null;
    }

    this.isLoading = false;
    
  }

  onMouseMove(event: MouseEvent){
    this.mouseX = event.clientX + 4;
    this.mouseY = event.clientY + 4;

    const viewportWidth = window.innerWidth;

    this.containerWidth  = this.hoverContainer?.nativeElement.clientWidth || 300;
    this.hoverDirection = this.mouseX + this.containerWidth > viewportWidth ? 'left' : 'right';
  }

  onMouseLeave(){
    this.isHovered = false;
    this.readme = null
  }

}
