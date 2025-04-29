import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GitApiService } from '../../services/git-api/git-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public repositories: any[] = [];

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
    console.log(response);

    this.repositories = response;
  }  

}
