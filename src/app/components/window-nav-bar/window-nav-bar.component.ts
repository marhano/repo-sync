import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../interfaces/user.interface';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-window-nav-bar',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './window-nav-bar.component.html',
  styleUrl: './window-nav-bar.component.scss'
})
export class WindowNavBarComponent {
  constructor(
    private location: Location
  ){

  }

  goBack(){
    this.location.back();
  }

  goForward(){
    this.location.forward();
  }
}
