import { Component, OnInit, inject } from '@angular/core';
import { WindowNavBarComponent } from '../../components/window-nav-bar/window-nav-bar.component';
import { GitApiService } from '../../services/git-api/git-api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-issue',
  imports: [
    WindowNavBarComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatMenuModule
  ],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.scss'
})
export class IssueComponent implements OnInit{
  issue?: any;
  user?: any;

  private readonly route = inject(ActivatedRoute);

  constructor(
    private gitApiService: GitApiService,
  ){
    
  }

  async ngOnInit() {
    this.route?.queryParams.subscribe(async (params) => {
      const data = params['data'];
      console.log(JSON.parse(data));
      this.issue = JSON.parse(data);
    });

    this.user = await this.gitApiService.getAuthUserInformation();
    console.log(this.user);
  }

}
