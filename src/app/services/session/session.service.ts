import { Injectable } from '@angular/core';
import { JsonService } from '../json/json.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private key: string = 'reposync__dev__session';

  constructor(
    private jsonService: JsonService,
  ) { 
  }

  async setSession(newData: { [key: string]: any }){
    const currentData = await this.getSession();

    const updatedData = { ...currentData, ...newData };
    
    //localStorage.setItem(this.key, JSON.stringify(updatedData));
    await this.jsonService.setItem(this.key, updatedData);
  }

  async getSession(key?: string): Promise<any>{
    //const storedData = localStorage.getItem(this.key);
    const storedData = await this.jsonService.getItem(this.key);
    
    if(!storedData){
      return key ? null : {};
    }

    return key ? storedData[key] : storedData;
  }

  async removeSession(key?: string): Promise<any>{
    await this.jsonService.removeItem(this.key);
  }
}
