import { Injectable } from '@angular/core';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private key: string = 'reposync__dev__session';

  constructor() { }

  setSession(newData: { [key: string]: any }){
    const currentData = this.getSession();
    const updatedData = { ...currentData, ...newData };
    localStorage.setItem(this.key, JSON.stringify(updatedData));
  }

  getSession(key?: string): any{
    const storedData = localStorage.getItem(this.key);
    
    if(!storedData){
      return key ? null : {};
    }

    const parseData = JSON.parse(storedData);
    
    return key ? parseData[key] || null : parseData;
  }
}
