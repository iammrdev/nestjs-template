import { LikeInfo, LikeStatus } from '../../../types/likes';

type ExtendedLikesInfo = {
  dislikesCount: number;
  likesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeInfo[];
};

type Props = {
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
  content: string;
  extendedLikesInfo: ExtendedLikesInfo;
  createdAt?: Date;
};

export class PostsEntity {
  public title: string;
  public shortDescription: string;
  public blogId: string;
  public blogName: string;
  public content: string;
  public extendedLikesInfo: ExtendedLikesInfo;
  public createdAt?: Date;

  constructor(post: Props) {
    this.fillEntity(post);
  }

  public fillEntity(props: Props) {
    this.title = props.title;
    this.shortDescription = props.shortDescription;
    this.blogId = props.blogId;
    this.blogName = props.blogName;
    this.content = props.content;
    this.extendedLikesInfo = props.extendedLikesInfo;
    this.createdAt = props.createdAt;
  }

  public toObject() {
    return {
      title: this.title,
      shortDescription: this.shortDescription,
      blogId: this.blogId,
      blogName: this.blogName,
      content: this.content,
      extendedLikesInfo: this.extendedLikesInfo,
      createdAt: this.createdAt,
    };
  }
}
