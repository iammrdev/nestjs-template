export type GetBlogsParams = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};
