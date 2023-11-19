import { AppBlog, AppBlogExtended } from '../../../types/blogs';
import { PaginationList } from '../../../types/common';

export type FindAllBlogsParams = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type FindAllBlogsResponse = PaginationList<AppBlog[]>;

export type FindAllBlogsExtendedResponse = PaginationList<AppBlogExtended[]>;

export type FindAllBlogsByUserResponse = AppBlog[];

export type FindAllBlogsByUserWithPaginationResponse = PaginationList<
  AppBlog[]
>;
