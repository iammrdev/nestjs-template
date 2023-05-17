type PaginationParams = {
  page: number;
  pageSize: number;
  totalCount: number;
};

export type PaginationView = {
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
};

export class Pagination {
  public page: number;
  public pageSize: number;
  public totalCount: number;

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

  toView(): PaginationView {
    return {
      page: this.page,
      pageSize: this.pageSize,
      pagesCount: this.pagesCount,
      totalCount: this.totalCount,
    };
  }
}
