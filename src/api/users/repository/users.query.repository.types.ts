export type FindAllUsersParams = {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type FindAllUsersWithBanInfoParams = FindAllUsersParams & {
  banStatus: 'all' | 'banned' | 'notBanned';
};
