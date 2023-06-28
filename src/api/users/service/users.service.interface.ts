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

export class GetUsersWithBanInfoQuery {
  public banStatus: 'all' | 'banned' | 'notBanned';
  public searchLoginTerm: string;
  public searchEmailTerm: string;
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}

export class VeirifyUserDto {
  public loginOrEmail: string;
  public password: string;
}
