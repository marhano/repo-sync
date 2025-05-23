import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GitApiService } from '../../services/git-api/git-api.service';
import { MarkdownModule } from 'ngx-markdown';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavigationStart, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import e from 'cors';

@Component({
  selector: 'app-card-repo',
  imports: [
    MatIconModule,
    CommonModule,
    MarkdownModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './card-repo.component.html',
  styleUrl: './card-repo.component.scss'
})
export class CardRepoComponent {
  @Input() repos: any;
  @Input() hover: boolean = false;
  @ViewChild('hoverContainer', { static: false }) hoverContainer!: ElementRef;

  public selectedRepo: any;
  public readme: any;

  public isHovered: boolean = false;
  public mouseX: number = 0;
  public mouseY: number = 0;
  public hoverDirection: string = 'right'; 
  public isLoading: boolean = true;
  public containerWidth: number = 0;

  private gitApiService = inject(GitApiService);

  async open(event: any, repo: any){
    const readme: any = await this.gitApiService.getRepositoryReadme(repo.full_name);
    repo.readme = readme.content ? atob(readme.content) : null;
    this.selectedRepo = repo;

    const repositoryContainer = document.querySelector('.repository-container') as HTMLElement;
    const card = event.target as HTMLElement;
    const cardParent = card.parentElement as HTMLElement;
    const cards = document.querySelectorAll('.card');
    const sidebard = document.querySelector('.sidebar') as HTMLElement;
    const sticky = document.querySelector('.sticky') as HTMLElement;
    const container = document.querySelectorAll('.container');

    cards.forEach((element) => {
      element.classList.remove('selected', 'focus', 'animating' );
      (element as HTMLElement).style.order = '0';
    });

    container.forEach((element) => {
      if((element as HTMLElement).style.margin !== '0px'){
        (element as HTMLElement).style.margin = '0px';
      }else{
        (element as HTMLElement).style.margin = '0px auto';
      }
    });

    sidebard.classList.add('sidebar-collapsed');
    if(sticky) sticky.classList.add('sticky-collapsed');
    
    card.style.order = '-1';
    card.classList.add('selected');

    this.showOverlay();

    setTimeout(() => {
       requestAnimationFrame(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }, 100);
   

    setTimeout(() => {
      const cardRect = card.getBoundingClientRect();
      const containerLeft = cardRect.right;
      repositoryContainer.style.left = `${containerLeft + 16}px`;
      repositoryContainer.style.paddingRight = `${containerLeft + 32}px`;

      repositoryContainer.classList.add('repository-container-open', 'animating');
    }, 300);
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

  hideOverlay(){
    const card = document.querySelector('.card.selected') as HTMLElement;
    let cardParent: any;
    if(card){
      cardParent = card.parentElement?.parentElement?.parentElement as HTMLElement;
    }
    const overlay = document.querySelector('.overlay') as HTMLElement;
    const sidebard = document.querySelector('.sidebar') as HTMLElement;
    const sticky = document.querySelector('.sticky') as HTMLElement;
    const repositoryContainer = document.querySelector('.repository-container') as HTMLElement;
    const container = document.querySelectorAll('.container');

    container.forEach((element) => {
      if((element as HTMLElement).style.margin === '0px'){
        (element as HTMLElement).style.margin = '0px auto';
      }
    });

    overlay.style.display = 'none';

    card.classList.remove('selected');
    card.style.order = '0';

    sidebard.classList.remove('sidebar-collapsed');
    repositoryContainer.classList.remove('repository-container-open');

    setTimeout(() => {      
      cardParent.scrollTo({
        top: card.offsetTop - cardParent.offsetTop,
        behavior: 'smooth'
      });

      card.classList.add('focus');

      if(sticky) sticky.classList.remove('sticky-collapsed');
    }, 200);
  }

  close(){
    this.hideOverlay();
  }

  onMouseMove(event: MouseEvent){
    if(this.hover){
      this.mouseX = event.clientX + 4;
      this.mouseY = event.clientY + 4;

      const viewportWidth = window.innerWidth;

      this.containerWidth  = this.hoverContainer?.nativeElement.clientWidth || 300;
      this.hoverDirection = this.mouseX + this.containerWidth > viewportWidth ? 'left' : 'right';
    }
    
  }

  onMouseLeave(){
    if(this.hover){
      this.isHovered = false;
      this.readme = null
    }
    
  }

  async onMouseEnter(item: any){
    if(this.hover){
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
  }

}
