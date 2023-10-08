type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
};

export type Blog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export type BlogExtended = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  banInfo: BanInfo;
  blogOwnerInfo: BlogOwnerInfo | null;
};
