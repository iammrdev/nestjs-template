export class CreateUserDto {
  public login: string;
  public password: string;
  public email: string;
}

export class GetUsersQuery {
  public searchLoginTerm: string;
  public searchEmailTerm: string;
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}
