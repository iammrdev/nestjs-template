type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
};

export type AppBlog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export type AppBlogExtended = AppBlog & {
  banInfo: BanInfo;
  blogOwnerInfo: BlogOwnerInfo | null;
};
