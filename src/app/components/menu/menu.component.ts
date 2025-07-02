import { Component, inject, Input } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Input() model!: any;

  private library = inject(FaIconLibrary);
  private route = inject(Router)

  constructor() {
    this.library.addIconPacks(fas, far);
  }

  openAccordion(event: any){
    console.log('expand');
    const target = event.target as HTMLElement;
    const parent = target.closest('.menu-item') as HTMLElement;

    if(parent){
      const submenu = parent.querySelector('.menu-submenu') as HTMLElement;

      if(submenu){
       if(submenu.classList.contains('expanded')){
        submenu.style.height = `${submenu.scrollHeight}px`;
        requestAnimationFrame(() => {
          submenu.style.height = '0';
        }); 
        submenu.classList.remove('expanded');
       }else{
        submenu.style.height = '0';
        submenu.classList.add('expanded');
        requestAnimationFrame(() => {
          submenu.style.height = `${submenu.scrollHeight}px`;
        });
       }
      }
    }
    console.log(target, parent);
  }

}
