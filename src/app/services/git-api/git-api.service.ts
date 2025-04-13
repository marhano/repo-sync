import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class GitApiService {
  private baseUrl = 'https://api.github.com';
  public token = ''//'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';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) { 
    const token = this.sessionService.getSession("token");
    if(token){
      this.token = token;
    }
  }

  private getHeaders(){
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.full+json'
    });
  }

  requestAccessToken(code: string): Promise<any>{
    return lastValueFrom(this.http.post('http://localhost:4000/api/exchange-token', { code }, {
      headers: { 'Content-Type': 'application/json' }
    }));
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

      return filteredIssues;
    });
  }

  listRepositoryPullRequest(name: string): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/pulls`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  getAuthUserInformation(){
    const url = `${this.baseUrl}/user`;
    return lastValueFrom(
      this.http.get(url, { headers: this.getHeaders() }).pipe(
        map((response: any) => {
          return {
            avatar_url: response.avatar_url,
            bio: response.bio,
            id: response.id,
            login: response.login,
          } as User;
        })
      ));
  }

  sendRequest(url: string):Promise<any>{
    return lastValueFrom(
      this.http.get(url, { headers: this.getHeaders() })
    );
  }

  listAssignees(name: string){
    const url = `${this.baseUrl}/repos/${name}/assignees`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  createIssue(name: string, param: any): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/issues`;
    return lastValueFrom(this.http.post(url, param, { headers: this.getHeaders(), observe: 'response' }));
  }

  listLabels(name: string){
    const url = `${this.baseUrl}/repos/${name}/labels`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

}
