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
    
    localStorage.setItem(this.key, JSON.stringify(updatedData));
  }

  async getSession(key?: string): Promise<any>{
    const storedDatas = localStorage.getItem(this.key) as any;
    let storedData;
    if(storedDatas){
      storedData = JSON.parse(storedDatas);
    }
    
    if(!storedData){
      return key ? null : {};
    }

    return key ? storedData[key] : storedData;
  }

  async removeSession(key?: string): Promise<any>{
    const storedDatas = localStorage.getItem(this.key);
    if (!storedDatas) return;

    const storedData = JSON.parse(storedDatas);

    if (key) {
      delete storedData[key];
      localStorage.setItem(this.key, JSON.stringify(storedData));
    } else {
      localStorage.removeItem(this.key);
    }
  }
}
