import { PaginationList } from '../types/common';

type PaginationParams = {
  page: number;
  pageSize: number;
  totalCount: number;
};

export type PaginationView<T> = {
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
  items: T[];
};

const defaultMapper = (item) => item;

export class Pagination<T> {
  public page: number;
  public pageSize: number;
  public totalCount: number;
  private items: T[] = [];

  constructor(params: PaginationParams) {
    this.page = params.page;
    this.pageSize = params.pageSize;
    this.totalCount = params.totalCount;
  }

  get pagesCount(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }

  public setItems(items: T[]) {
    this.items = items;

    return this;
  }

  public mapItems(mapper: (item: T) => T) {
    this.items = this.items.map(mapper);

    return this;
  }

  toView<R>(mapper: (item: T) => R = defaultMapper): PaginationList<R[]> {
    return {
      page: this.page,
      pageSize: this.pageSize,
      pagesCount: this.pagesCount,
      totalCount: this.totalCount,
      items: this.items.map(mapper),
    };
  }
}
