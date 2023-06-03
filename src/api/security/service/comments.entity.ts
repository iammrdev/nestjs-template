import { ForbiddenException } from '@nestjs/common';
import { LikeStatus } from '../../../types/likes';

type LikesInfo = {
  dislikes: string[];
  likes: string[];
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type Props = {
  id?: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikesInfo;
  createdAt?: Date;
};

export class CommentsEntity {
  public postId: string;
  public content: string;
  public commentatorInfo: CommentatorInfo;
  public likesInfo: LikesInfo;

  public id?: string;
  public currentUserId?: string;
  public createdAt?: Date;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  private getLikeStatus() {
    if (!this.currentUserId) {
      return LikeStatus.None;
    }

    const hasLike = this.likesInfo.likes.includes(this.currentUserId);

    if (hasLike) {
      return LikeStatus.Like;
    }

    const hasDislike = this.likesInfo.dislikes.includes(this.currentUserId);

    if (hasDislike) {
      return LikeStatus.Dislike;
    }

    return LikeStatus.None;
  }

  public setId(id: string) {
    this.id = id;

    return this;
  }

  public setCurrentUser(userId?: string) {
    this.currentUserId = userId;

    return this;
  }

  public fillEntity(props: Props) {
    this.id = props.id;
    this.postId = props.postId;
    this.content = props.content;
    this.commentatorInfo = props.commentatorInfo;
    this.likesInfo = props.likesInfo;
    this.createdAt = props.createdAt;
  }

  public setLikeStatus(likeStatus: LikeStatus) {
    if (!this.currentUserId) {
      throw new ForbiddenException('Forbidden');
    }

    const currentLikeStatus = this.getLikeStatus();

    const hasLike = currentLikeStatus === LikeStatus.Like;
    const hasDislike = currentLikeStatus === LikeStatus.Dislike;

    if (likeStatus === LikeStatus.Like) {
      if (!hasLike) {
        this.likesInfo.likes = [...this.likesInfo.likes, this.currentUserId];
      }

      if (hasDislike) {
        this.likesInfo.dislikes = this.likesInfo.dislikes.filter(
          (item) => item !== this.currentUserId,
        );
      }

      return this;
    }

    if (likeStatus === LikeStatus.Dislike) {
      if (!hasDislike) {
        this.likesInfo.dislikes = [
          ...this.likesInfo.dislikes,
          this.currentUserId,
        ];
      }

      if (hasLike) {
        this.likesInfo.likes = this.likesInfo.likes.filter(
          (item) => item !== this.currentUserId,
        );
      }

      return this;
    }

    this.likesInfo = {
      likes: this.likesInfo.likes.filter((item) => item !== this.currentUserId),
      dislikes: this.likesInfo.dislikes.filter(
        (item) => item !== this.currentUserId,
      ),
    };

    return this;
  }

  public toModel() {
    return {
      postId: this.postId,
      content: this.content,
      commentatorInfo: this.commentatorInfo,
      likesInfo: this.likesInfo,
      createdAt: this.createdAt,
    };
  }

  public toView() {
    if (!this.id || !this.createdAt) {
      throw new Error('Incorrect model data');
    }

    return {
      id: this.id,
      content: this.content,
      commentatorInfo: this.commentatorInfo,
      likesInfo: {
        likesCount: this.likesInfo.likes.length,
        dislikesCount: this.likesInfo.dislikes.length,
        myStatus: this.getLikeStatus(),
      },
      createdAt: this.createdAt,
    };
  }
}
