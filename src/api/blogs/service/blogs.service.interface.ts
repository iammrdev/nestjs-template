export class CreateBlogDto {
  public name: string;
  public description: string;
  public websiteUrl: string;
}

export class GetBlogsQuery {
  public searchNameTerm: string;
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}

export type UserData = { id: string; login: string };
