type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

export type Blog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  blogOwnerInfo?: BlogOwnerInfo;
};
