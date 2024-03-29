type LikeAction = {
  addedAt: Date;
  login: string;
  userId: string;
};

type LikesInfo = {
  dislikes: LikeAction[];
  likes: LikeAction[];
};

export type AppPost = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  authorId?: string;
  createdAt: Date;
  likesInfo: LikesInfo;
  status: 'active' | 'hidden-by-ban';
};
