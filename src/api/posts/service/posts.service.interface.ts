export class CreatePostDto {
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
  public blogName: string;
}

export class UpdatePostDto {
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
  public blogName: string;
}

export class GetPostsQuery {
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}
