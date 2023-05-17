import { LikeInfo, LikeStatus } from '../../../types/likes';

type Props = {
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
  content: string;
  createdAt?: Date;
  extendedLikesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: LikeStatus;
    newestLikes: LikeInfo[];
  };
};

export class PostsEntity {
  public title: string;
  public shortDescription: string;
  public blogId: string;
  public blogName: string;
  public content: string;
  public createdAt?: Date;
  public extendedLikesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: LikeStatus;
    newestLikes: LikeInfo[];
  };

  constructor(post: Props) {
    this.fillEntity(post);
  }

  public fillEntity(props: Props) {
    this.title = props.title;
    this.shortDescription = props.shortDescription;
    this.blogId = props.blogId;
    this.blogName = props.blogName;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.extendedLikesInfo = props.extendedLikesInfo;
  }

  public toObject() {
    return {
      title: this.title,
      shortDescription: this.shortDescription,
      blogId: this.blogId,
      blogName: this.blogName,
      content: this.content,
      createdAt: this.createdAt,
      extendedLikesInfo: this.extendedLikesInfo,
    };
  }
}
