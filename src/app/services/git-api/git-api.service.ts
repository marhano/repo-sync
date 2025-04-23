import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class GitApiService {
  private baseUrl = 'https://api.github.com';
  public token = '';//'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';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) {
  }

  private async getHeaders(){
    const token = await this.sessionService.getSession('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.full+json'
    });
  }

  requestAccessToken(code: string): Promise<any>{
    return lastValueFrom(this.http.post('http://localhost:3000/api/exchange-token', { code }, {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  async listRepositories(): Promise<any>{
    const url = `${this.baseUrl}/user/repos`;
    const response = lastValueFrom(this.http.get(url, 
      { 
        headers: await this.getHeaders(),
        params: {
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member',
          per_page: "100"
        }
    }));
    return response
  }

  async listRepositoryIssues(name: string): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/issues`;

    return lastValueFrom(
      this.http.get(url, { 
        headers: await this.getHeaders(), 
        params: { state: "open" }
      })
    ).then((response: any) => {
      const filteredIssues = response.filter((issue: any) => !issue.pull_request);
      console.log(filteredIssues);

      return filteredIssues;
    });
  }

  async listRepositoryPullRequest(name: string): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/pulls`;
    return lastValueFrom(this.http.get(url, { headers: await this.getHeaders() }));
  }

  async getAuthUserInformation(){
    const url = `${this.baseUrl}/user`;
    return lastValueFrom(
      this.http.get(url, { headers: await this.getHeaders() }).pipe(
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

  async sendRequest(url: string):Promise<any>{
    return lastValueFrom(
      this.http.get(url, { headers: await this.getHeaders() })
    );
  }

  async listAssignees(name: string){
    const url = `${this.baseUrl}/repos/${name}/assignees`;
    return lastValueFrom(this.http.get(url, { headers: await this.getHeaders() }));
  }

  async createIssue(name: string, param: any): Promise<any>{
    const url = `${this.baseUrl}/repos/${name}/issues`;
    return lastValueFrom(this.http.post(url, param, { headers: await this.getHeaders(), observe: 'response' }));
  }

  async listLabels(name: string){
    const url = `${this.baseUrl}/repos/${name}/labels`;
    return lastValueFrom(this.http.get(url, { headers: await this.getHeaders() }));
  }

}
