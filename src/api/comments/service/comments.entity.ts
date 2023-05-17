import { LikeStatus } from '../../../types/likes';

type LikesInfo = {
  dislikesCount: number;
  likesCount: number;
  myStatus: LikeStatus;
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type Props = {
  content: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikesInfo;
  createdAt?: Date;
};

export class CommentsEntity {
  public content: string;
  public commentatorInfo: CommentatorInfo;
  public likesInfo: LikesInfo;
  public createdAt?: Date;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public fillEntity(props: Props) {
    this.content = props.content;
    this.commentatorInfo = props.commentatorInfo;
    this.likesInfo = props.likesInfo;
    this.createdAt = props.createdAt;
  }

  public toObject() {
    return {
      content: this.content,
      commentatorInfo: this.commentatorInfo,
      likesInfo: this.likesInfo,
      createdAt: this.createdAt,
    };
  }
}
