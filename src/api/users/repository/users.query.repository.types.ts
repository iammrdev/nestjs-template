import { PaginationList } from '../../../types/common';
import { BanInfo } from './user.model.types';

export type FindAllUsersParams = {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  pageNumber: number;
  pageSize: number;
};

export type FindAllUsersWithBanInfoParams = FindAllUsersParams & {
  banStatus: 'all' | 'banned' | 'notBanned';
};

export type FindAllUsersResponse = PaginationList<
  {
    id: string;
    login: string;
    email: string;
    createdAt: Date;
  }[]
>;

export type FindAllUsersWithBanInfoResponse = PaginationList<
  {
    id: string;
    login: string;
    email: string;
    banInfo: BanInfo;
    createdAt: Date;
  }[]
>;
