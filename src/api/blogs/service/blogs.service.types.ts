export type CreateBlogParams = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type UpdateBlogParams = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type UserData = { id: string; login: string };
