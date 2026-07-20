import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CrudResponse, PaginatedResponse, Task } from './task.model';

export type TaskStatusFilter = 'completed' | 'incomplete';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = `${environment.serverUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(
    page = 1,
    pageSize = 10,
    search = '',
    status?: TaskStatusFilter,
  ): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Task>>(this.baseUrl, { params });
  }

  createTask(title: string, description: string): Observable<Task> {
    return this.http
      .post<CrudResponse<Task>>(this.baseUrl, { title, description })
      .pipe(map(response => response.data));
  }

  updateTask(id: number, changes: Partial<Pick<Task, 'title' | 'description' | 'completed'>>): Observable<Task> {
    return this.http
      .patch<CrudResponse<Task>>(`${this.baseUrl}/${id}`, changes)
      .pipe(map(response => response.data));
  }

  bulkUpdateStatus(ids: number[], completed: boolean): Observable<Task[]> {
    return this.http
      .patch<CrudResponse<Task[]>>(`${this.baseUrl}/bulk`, { ids, completed })
      .pipe(map(response => response.data));
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
