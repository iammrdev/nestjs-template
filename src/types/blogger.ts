type BanInfo = {
  isBanned: boolean;
  banReason: string | null;
  banDate: Date | null;
};

export type AppBlogger = {
  id: string;
  login: string;
  banInfo: BanInfo;
};
