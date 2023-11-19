type LikesInfo = {
  dislikes: string[];
  likes: string[];
};

type Status = 'active' | 'hidden-by-ban';

export type AppComment = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  status: Status;
  likesInfo: LikesInfo;
  createdAt: Date;
};
