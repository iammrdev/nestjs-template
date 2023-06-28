export class GetBlogsParams {
  public searchNameTerm: string;
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}

export type UserData = { id: string; login: string };
