import { LikeStatus } from '../../../types/likes';
import { ForbiddenException } from '@nestjs/common';
import { Post } from '../../../types/posts';

type LikeAction = {
  addedAt: Date;
  login: string;
  userId: string;
};

type ExtendedLikesInfo = {
  dislikes: LikeAction[];
  likes: LikeAction[];
};

type Props = {
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
  content: string;
  extendedLikesInfo: ExtendedLikesInfo;
  status?: 'active' | 'hidden';
  id?: string;
  authorId?: string;
  createdAt?: Date;
};

export class PostsEntity {
  public title: string;
  public shortDescription: string;
  public blogId: string;
  public blogName: string;
  public content: string;
  public extendedLikesInfo: ExtendedLikesInfo;

  public id?: string;
  public authorId?: string;
  public status?: 'active' | 'hidden';
  public currentUser?: {
    id: string;
    login: string;
  };
  public createdAt?: Date;
  public bannedUsersIds?: string[];

  constructor(props: Props) {
    this.fillEntity(props);
  }

  private getLikeStatus() {
    if (!this.currentUser) {
      return LikeStatus.None;
    }

    const hasLike = this.extendedLikesInfo.likes.some(
      (item) => item.userId === this.currentUser?.id,
    );

    if (hasLike) {
      return LikeStatus.Like;
    }

    const hasDislike = this.extendedLikesInfo.dislikes.some(
      (item) => item.userId === this.currentUser?.id,
    );

    if (hasDislike) {
      return LikeStatus.Dislike;
    }

    return LikeStatus.None;
  }

  public setId(id: string) {
    this.id = id;

    return this;
  }

  public setAuthorId(userId?: string) {
    this.authorId = userId;

    return this;
  }

  public setCurrentUser(user?: { id: string; login: string }) {
    this.currentUser = user;

    return this;
  }

  public setBannedUsersIds(bannedUsersIds: string[]) {
    this.bannedUsersIds = bannedUsersIds;

    if (this.extendedLikesInfo) {
      this.extendedLikesInfo.likes = this.extendedLikesInfo.likes.filter(
        (item) => !this.bannedUsersIds?.includes(item.userId),
      );
      this.extendedLikesInfo.dislikes = this.extendedLikesInfo.dislikes.filter(
        (item) => !this.bannedUsersIds?.includes(item.userId),
      );
    }

    return this;
  }

  public fillEntity(props: Props) {
    this.id = props.id;
    this.title = props.title;
    this.shortDescription = props.shortDescription;
    this.blogId = props.blogId;
    this.blogName = props.blogName;
    this.content = props.content;
    this.extendedLikesInfo = props.extendedLikesInfo;
    this.createdAt = props.createdAt;
    this.status = props.status;
  }

  public setLikeStatus(likeStatus: LikeStatus) {
    if (!this.currentUser) {
      throw new ForbiddenException('Forbidden');
    }

    const currentLikeStatus = this.getLikeStatus();

    const hasLike = currentLikeStatus === LikeStatus.Like;
    const hasDislike = currentLikeStatus === LikeStatus.Dislike;

    const likeAction = {
      userId: this.currentUser.id,
      login: this.currentUser.login,
      addedAt: new Date(),
    };

    if (likeStatus === LikeStatus.Like) {
      if (!hasLike) {
        this.extendedLikesInfo.likes = [
          ...this.extendedLikesInfo.likes,
          likeAction,
        ];
      }

      if (hasDislike) {
        this.extendedLikesInfo.dislikes =
          this.extendedLikesInfo.dislikes.filter(
            (item) => item.userId !== this.currentUser?.id,
          );
      }

      return this;
    }

    if (likeStatus === LikeStatus.Dislike) {
      if (!hasDislike) {
        this.extendedLikesInfo.dislikes = [
          ...this.extendedLikesInfo.dislikes,
          likeAction,
        ];
      }

      if (hasLike) {
        this.extendedLikesInfo.likes = this.extendedLikesInfo.likes.filter(
          (item) => item.userId !== this.currentUser?.id,
        );
      }

      return this;
    }

    this.extendedLikesInfo = {
      likes: this.extendedLikesInfo.likes.filter(
        (item) => item.userId !== this.currentUser?.id,
      ),
      dislikes: this.extendedLikesInfo.dislikes.filter(
        (item) => item.userId !== this.currentUser?.id,
      ),
    };

    return this;
  }

  public toModel() {
    return {
      title: this.title,
      shortDescription: this.shortDescription,
      blogId: this.blogId,
      blogName: this.blogName,
      content: this.content,
      extendedLikesInfo: this.extendedLikesInfo,
      authorId: this.authorId,
      createdAt: this.createdAt,
      status: this.status,
    };
  }

  public toView(): Post {
    if (!this.id || !this.createdAt) {
      throw new Error('Incorrect model data');
    }

    return {
      id: this.id,
      title: this.title,
      shortDescription: this.shortDescription,
      blogId: this.blogId,
      blogName: this.blogName,
      content: this.content,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        likesCount: this.extendedLikesInfo.likes.length,
        dislikesCount: this.extendedLikesInfo.dislikes.length,
        myStatus: this.getLikeStatus(),
        newestLikes:
          this.extendedLikesInfo.likes
            .sort((like1, like2) => {
              if (like2.addedAt > like1.addedAt) {
                return 1;
              } else if (like2.addedAt < like1.addedAt) {
                return -1;
              }

              return 0;
            })
            .slice(0, 3)
            .map((item) => ({
              ...item,
              addedAt: item.addedAt,
            })) || [],
      },
    };
  }
}
