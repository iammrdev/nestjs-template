export type GetBlogUsersQuery = {
  isBanned?: boolean;
  searchLoginTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};
