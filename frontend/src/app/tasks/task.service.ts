import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse, Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = `${environment.serverUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(page = 1, pageSize = 10, search = ''): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Task>>(this.baseUrl, { params });
  }
}
