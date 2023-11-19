import { PaginationList } from '../../../types/common';
import { BanInfo } from './bloggers.model.types';

export type GetBloggersQuery = {
  isBanned?: boolean;
  searchLoginTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type FindAllUsersByBlogResponse = PaginationList<
  {
    id: string;
    login: string;
    banInfo: BanInfo;
  }[]
>;
