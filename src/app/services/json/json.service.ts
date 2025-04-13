import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonService {
  private nodeApiUrl = 'http://localhost:4000/api/session';

  constructor(
    private http: HttpClient
  ) { }

  getItem(key: string): Promise<any>{
    return lastValueFrom(this.http.get(`${this.nodeApiUrl}/${key}`));
  }

  setItem(key: string, value: any): Promise<any>{
    return lastValueFrom(this.http.post(this.nodeApiUrl, { key, value }));
  }

  removeItem(key: string): Promise<any>{
    return lastValueFrom(this.http.delete(`${this.nodeApiUrl}/${key}`));
  }

  getAll(): Promise<any>{
    return lastValueFrom(this.http.get(this.nodeApiUrl));
  }
}
