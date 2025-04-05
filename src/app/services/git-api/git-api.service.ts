import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitApiService {
  private baseUrl = 'https://api.github.com';
  private token = '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';

  constructor(
    private http: HttpClient
  ) { }

  private getHeaders(){
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json'
    });
  }

  listRepositories(): Promise<any>{
    const url = `${this.baseUrl}/user/repos`;
    return lastValueFrom(this.http.get(url, 
      { 
        headers: this.getHeaders(),
        params: {
          visibility: 'all',
          affiliation: 'collaborator',
          per_page: "100"
        }
    }));
  }

  listRepositoryIssues(name: string): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/issues`;

    return lastValueFrom(
      this.http.get(url, { 
        headers: this.getHeaders(), 
        params: { state: "open" }
      })
    ).then((response: any) => {
      const filteredIssues = response.filter((issue: any) => !issue.pull_request);
      console.log(filteredIssues);

      return filteredIssues.map((issue: any) => ({
        issueNumber: issue.number,
        title: issue.title,
        author: issue.user.login,
        authorAvatar: issue.user.avatar_url,
        assignee: issue.assignee ? issue.assignee.login : null,
        assigneeAvatar: issue.assignee ? issue.assignee.avatar_url : null
      }));
    });
  }

  listRepositoryPullRequest(name: string): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/pulls`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }


}
