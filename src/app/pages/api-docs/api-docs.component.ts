import { ChangeDetectorRef, Component, ElementRef, inject, input, QueryList, resource, ViewChildren } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MarkdownModule } from 'ngx-markdown';
import * as Prism from 'prismjs';
import 'prismjs/components';
import 'prismjs/plugins/toolbar/prism-toolbar.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
import { GitApiService } from '../../services/git-api/git-api.service';
import { fromEvent, throttleTime } from 'rxjs';

@Component({
  selector: 'app-api-docs',
  imports: [
    FontAwesomeModule,
    MarkdownModule,
    MatTabsModule
  ],
  templateUrl: './api-docs.component.html',
  styleUrl: './api-docs.component.scss'
})
export class ApiDocsComponent {
  @ViewChildren('section') sections!: QueryList<ElementRef>;
  public active: string = '';

  id = input<string>();

  docs = resource({
    request: this.id,
    loader: ({ request: id }) => this.gitApiService.getApiDocFile(id) 
  });

  private gitApiService = inject(GitApiService);

  async ngAfterViewInit() {
    setTimeout(() => {
      Prism.highlightAll();
    }, 200);

    const container = document.querySelector('.container') as HTMLElement;

    if(container){
      fromEvent(container, 'scroll')
        .pipe(throttleTime(100))
        .subscribe(() => {
          console.log('throttle');
          this.updateActiveSection(container);
        });
    }
  }

  private updateActiveSection(container: HTMLElement){
    for (const section of this.sections) {
      const rect = section.nativeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (rect.top >= containerRect.top && rect.top < containerRect.bottom) {
        this.active = section.nativeElement.id;
        break;
      }
    }
  }

  onTabChange(){
    setTimeout(() => {
      Prism.highlightAll();
    }, 100);
  }

  scrollToSection(sectionId: string){
    const section = document.getElementById(sectionId) as HTMLElement;
    const container = section?.closest('.container') as HTMLElement;

    
    if (section && container) {
      container.scrollTo({
        top: section.offsetTop - container.offsetTop + 16,
        behavior: 'instant'
      });
    }
  }

  collpaseSidebar(){
    const sidebar = document.querySelector('aside') as HTMLElement;
    sidebar.classList.toggle('collapsed');
    const uncollapsed = document.querySelector('.uncollapse-sidebar') as HTMLElement;
    uncollapsed.classList.toggle('show');
  }

  uncollpaseSidebar(){
    const sidebar = document.querySelector('aside') as HTMLElement;
    sidebar.classList.remove('collapsed');
    const uncollapsed = document.querySelector('.uncollapse-sidebar') as HTMLElement;
    uncollapsed.classList.remove('show');
  }

}
