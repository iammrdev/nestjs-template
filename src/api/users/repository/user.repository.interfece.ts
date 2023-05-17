export class GetUsersParams {
  public searchLoginTerm: string;
  public searchEmailTerm: string;
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}
