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

  async listRepositories(data: any): Promise<any>{
    const url = `${this.baseUrl}/user/repos`;
    return lastValueFrom(
      this.http.get(url, { 
        headers: await this.getHeaders(),
        params: data.params
      })
    ).then((response: any) => {
      const filteredRepos = response.filter((repo: any) => repo.owner.login === data.owner);

      return filteredRepos;
    });
  }

  async listIssuesAssigned(data: any): Promise<any>{
    const url = `${this.baseUrl}/issues`;
    
    return lastValueFrom(
      this.http.get(url, { 
        headers: await this.getHeaders(), 
        params: { state: "open", sort: "updated", direction: "desc" }
      })
    ).then((response: any) => {
      const filteredIssues = response.filter((issue: any) => !issue.pull_request).filter((issue: any) => issue.repository.owner.login === data.owner);
      console.log(filteredIssues);

      return filteredIssues;
    });
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

  async getRepositoryReadme(name: string){
    const url = `${this.baseUrl}/repos/${name}/readme`;
    return lastValueFrom(this.http.get(url, { headers: await this.getHeaders() }));
  }

  async updateIssue(url: string, params: any): Promise<any>{
    return lastValueFrom(this.http.patch(url, params, {
      headers: await this.getHeaders()
    }))
  }

 async getApiDocs() {
  const url = `${this.baseUrl}/repos/marhano/api-docs/contents/docs`;

  try {
    // Fetch the list of files in the 'docs' folder
    const result: any[] = await lastValueFrom(this.http.get<any[]>(url, { headers: await this.getHeaders() }));

    // Filter for JSON files
    const jsonFiles = result.filter((item) => item.type === 'file' && item.name.endsWith('.json'));

    if (jsonFiles.length > 0) {
      
      const docs: any[] = [];

      for (const element of jsonFiles) {
        docs.push(element.name);
      }
      // Fetch the contents of the first JSON file


      return docs;
    } else {
      console.warn('No JSON files found in the specified folder.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching API docs:', error);
    throw error; // Re-throw the error for further handling
  }
}

async getApiDocFile(name: string){
  const url = `${this.baseUrl}/repos/marhano/api-docs/contents/docs/${name}`;
  return lastValueFrom(this.http.get(url, { headers: await this.getHeaders() })).then((response: any) => {
    const decodedContent = atob(response.content);

    return JSON.parse(decodedContent);
  });
}

}
