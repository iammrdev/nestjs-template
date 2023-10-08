import { PostsModelData } from './posts.model.types';

export type GetPostsParams = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type PostsQueryData = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  authorId?: string;
  status: 'active' | 'hidden-by-ban';
  createdAt: Date;
  likesInfo: PostsModelData['likesInfo'];
};
