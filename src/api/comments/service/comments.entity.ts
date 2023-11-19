import { ForbiddenException } from '@nestjs/common';
import { LikeStatus } from '../../../types/likes';
import { CommentsModelData } from '../repository/comments.model.types';

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
  status: 'active' | 'hidden-by-ban';
  createdAt: Date;
};

export type CommentView = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  createdAt: Date;
};

export class CommentsEntity {
  public postId: string;
  public content: string;
  public commentatorInfo: CommentatorInfo;
  public likesInfo: LikesInfo;

  public id?: string;
  public currentUserId?: string;
  public status: 'active' | 'hidden-by-ban';
  public createdAt: Date;
  public bannedUsersIds?: string[];

  constructor(props: Props) {
    this.fillEntity(props);
  }

  private getLikeStatus(): LikeStatus {
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

  public setId(id: string): CommentsEntity {
    this.id = id;

    return this;
  }

  public setCurrentUser(userId?: string): CommentsEntity {
    this.currentUserId = userId;

    return this;
  }

  public setBannedUsersIds(bannedUsersIds: string[]): CommentsEntity {
    this.bannedUsersIds = bannedUsersIds;

    if (this.likesInfo) {
      this.likesInfo.likes = this.likesInfo.likes.filter(
        (item) => !this.bannedUsersIds?.includes(item),
      );
      this.likesInfo.dislikes = this.likesInfo.dislikes.filter(
        (item) => !this.bannedUsersIds?.includes(item),
      );
    }

    return this;
  }

  public fillEntity(props: Props): void {
    this.id = props.id;
    this.postId = props.postId;
    this.content = props.content;
    this.commentatorInfo = props.commentatorInfo;
    this.likesInfo = props.likesInfo;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  public setLikeStatus(likeStatus: LikeStatus): CommentsEntity {
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

  public toModel(): Omit<CommentsModelData, '_id'> {
    return {
      postId: this.postId,
      content: this.content,
      commentatorInfo: this.commentatorInfo,
      likesInfo: this.likesInfo,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  public toView(): CommentView {
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

type CreateCommentsEntityParams = {
  content: string;
  postId: string;
  userId: string;
  userLogin: string;
};

export const createCommentsEntity = (
  params: CreateCommentsEntityParams,
): CommentsEntity => {
  return new CommentsEntity({
    content: params.content,
    postId: params.postId,
    commentatorInfo: {
      userId: params.userId,
      userLogin: params.userLogin,
    },
    status: 'active',
    likesInfo: {
      dislikes: [],
      likes: [],
    },
    createdAt: new Date(),
  });
};
