import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-select-dialog',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './select-dialog.component.html',
  styleUrl: './select-dialog.component.scss'
})
export class SelectDialogComponent {
  @Input() label: string = '';
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() data: any;

  @Output() selectedCheckboxes = new EventEmitter<any[]>();

  selectedItems: any[] = [];

  ngAfterViewInit(){
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  onCheckboxChange(item: any, isChecked: boolean){
    if(isChecked){
      this.selectedItems.push(item);
    }else{
      this.selectedItems = this.selectedItems.filter(i => i !== item );
    }

    this.selectedCheckboxes.emit(this.selectedItems);
  }

  showSelectDialog(event: MouseEvent){
    event.stopPropagation();

    const button = event.target as HTMLElement;
    const container = button.parentElement;

    if(container){
      const selectDialog = container?.querySelector('.select-dialog') as HTMLElement;

      if(selectDialog){
        const isVisible = selectDialog.style.display === "block";
        this.closeAllDialogs();
        selectDialog.style.display = isVisible ? 'none' : 'block';
      
        button.classList.toggle('active', !isVisible);
      }
    }
  }

  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if(!target.closest('.select-dialog-container')){
      this.closeAllDialogs();
    }
  }

  closeAllDialogs(){
    const dialogs = document.querySelectorAll('.select-dialog') as NodeListOf<HTMLElement>;
    const buttons = document.querySelectorAll('.setting-button') as NodeListOf<HTMLElement>;

    dialogs.forEach(dialog => dialog.style.display = 'none');
    buttons.forEach(button => button.classList.remove('active'));
  }

  ngOnDestroy(){
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

}
