export interface CrudResponse<T> {
  data: T;
}

export interface GetPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
