import { Injectable } from '@angular/core';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class IssueTrackerService {

  constructor(
    private sessionService: SessionService
  ) { }

  async getIssueTrackerDataBy(){
    return await this.sessionService.getSession('viewed');
  }

  async getIssueTrackerDataById(id: number){
    const issueTrackerData = await this.sessionService.getSession('viewed');
    if(issueTrackerData){
      return issueTrackerData.find((issue: any) => issue.id === id);
    }
    return null;
  }

  async setIssueTrackerDataById(data: any){
    const url = this.extractRepositoryName(data.url);
    console.log(url);
    const issueTrackerData = await this.sessionService.getSession('viewed');
    if(issueTrackerData){

      if(issueTrackerData[url.owner] && issueTrackerData[url.owner][url.repo]){
        const issueIndex = issueTrackerData[url.owner][url.repo].findIndex((issue: any) => issue === data.id);
        if(issueIndex !== -1){
          console.log('Issue already exists in the array.');
          return;
        }
        issueTrackerData[url.owner][url.repo].push(data.id);

        await this.sessionService.setSession({ viewed: issueTrackerData });
        return;
      }
      if(issueTrackerData[url.owner]){
        issueTrackerData[url.owner][url.repo] = [data.id];
        await this.sessionService.setSession({ viewed: issueTrackerData });
        return;
      }
    }

    await this.sessionService.setSession({ viewed: {
      [url.owner]: {
        [url.repo]: [data.id]
      }
    } });
  }

  extractRepositoryName(url: string): { owner: string, repo: string} {
    const urlParts = url.split('/');
    const repoIndex = urlParts.indexOf('repos') + 1;

    return {
      owner: urlParts[repoIndex],
      repo: urlParts[repoIndex + 1]
    };
  }

  

}
