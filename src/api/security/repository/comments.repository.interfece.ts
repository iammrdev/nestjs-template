import { CommentRepo } from './comments.model';

export class GetCommentsParams {
  public sortBy: string;
  public sortDirection: 'desc' | 'asc';
  public pageNumber: number;
  public pageSize: number;
}

export type CommentData = {
  id: string;
  postId: CommentRepo['postId'];
  content: CommentRepo['content'];
  likesInfo: CommentRepo['likesInfo'];
  commentatorInfo: CommentRepo['commentatorInfo'];
  createdAt: CommentRepo['createdAt'];
};
