import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-editor',
  imports: [
    MatIconModule,
    MarkdownModule,
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss'
})
export class MarkdownEditorComponent {
  activeTab: string = 'write';
  markdownContent: string = ``;

  activateTab(tab: string){
    this.activeTab = tab;
  }

  insertMarkdown(markdown: string) {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const selectedText = this.markdownContent.slice(selectionStart, selectionEnd);

    const leadingSpace = selectedText.match(/^\s+/)?.[0] || '';
    const trailingSpace = selectedText.match(/\s+$/)?.[0] || '';

    let wrappedText: string;

    if(markdown === '###'){
      wrappedText = `${leadingSpace}${markdown} ${selectedText.trim()}${trailingSpace}`;
    }else{
      wrappedText = `${leadingSpace}${markdown}${selectedText.trim()}${markdown}${trailingSpace}`;
    }
   

    const textBefore = this.markdownContent.slice(0, selectionStart);
    const textAfter = this.markdownContent.slice(selectionEnd);

    this.markdownContent = textBefore + wrappedText + textAfter;

    setTimeout(() => {
      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionStart + wrappedText.length;
    }, 0);
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset height to auto for accurate calculation
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on content
  }

}
