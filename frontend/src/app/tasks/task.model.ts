export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrudResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
