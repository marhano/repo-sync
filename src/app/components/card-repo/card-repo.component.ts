import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GitApiService } from '../../services/git-api/git-api.service';
import { MarkdownModule } from 'ngx-markdown';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-card-repo',
  imports: [
    MatIconModule,
    CommonModule,
    MarkdownModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './card-repo.component.html',
  styleUrl: './card-repo.component.scss'
})
export class CardRepoComponent {
  @Input() repos: any;
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
    repositoryContainer.style.opacity = '100%';

    this.showOverlay();

    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    setTimeout(() => {
      if(sticky){
        sticky.style.height = '0px';
        sticky.style.transform = 'translateY(-500px)';
        sticky.style.padding = '0px';
      }
      

      const cardRect = card.getBoundingClientRect();
      const containerLeft = cardRect.right;
      repositoryContainer.style.left = `${containerLeft + 16}px`;
    }, 300);
    cardParent.scrollTo({
      top: card.offsetTop - cardParent.offsetTop,
      behavior: 'smooth'
    });
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
    const cardParent = card.parentElement as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;
    const sidebard = document.querySelector('.sidebar') as HTMLElement;
    const sticky = document.querySelector('.sticky') as HTMLElement;
    const repositoryContainer = document.querySelector('.repository-container') as HTMLElement;

    overlay.style.display = 'none';
    card.classList.remove('selected');
    card.style.order = '0';
    sidebard.style.minWidth = '250px';
    repositoryContainer.style.transform = 'translateX(100%)';
    repositoryContainer.style.transform = '0';

    setTimeout(() => {      
      cardParent.scrollTo({
        top: card.offsetTop - cardParent.offsetTop,
        behavior: 'instant'
      });
      card.classList.add('focus');

      if(sticky){
        sticky.style.height = 'initial';
        sticky.style.transform = 'translateY(0px)';
        sticky.style.padding = '0 0 24px';
      }
    }, 200);
  }

  close(){
    this.hideOverlay();
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
}
