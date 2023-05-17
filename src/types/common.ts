export type PaginationList<T> = {
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
  items: T;
};
