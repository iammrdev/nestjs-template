import { PaginationList } from '../../../types/common';
import { AppPost } from '../../../types/posts';

export type GetPostsParams = {
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type FindAllPostsResponse = PaginationList<AppPost[]>;

export type FindAllPostsByBlogResponse = PaginationList<AppPost[]>;

export type FindAllPostsByBlogsResponse = AppPost[];
