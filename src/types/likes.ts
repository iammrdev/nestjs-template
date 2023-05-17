export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikeInfo = {
  addedAt: Date;
  login: string;
  userId: string;
};
