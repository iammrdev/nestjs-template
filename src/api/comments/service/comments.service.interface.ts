import { LikeStatus } from '../../../types/likes';

export class GetCommentsQuery {
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}

export class CreateCommentDto {
  public content: string;
  public userId: string;
  public userLogin: string;
}

export class UpdateCommentDto {
  public content: string;
  public userId: string;
}

export class UpdateCommentLikeStatusDto {
  public userId: string;
  public likeStatus: LikeStatus;
}
