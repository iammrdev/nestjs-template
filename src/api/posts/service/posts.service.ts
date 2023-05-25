import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePostDto,
  GetPostsQuery,
  UpdatePostDto,
  UpdatePostLikeStatusDto,
  UserData,
} from './posts.service.interface';
import { Post } from '../../../types/posts';
import { PostsRepository } from '../repository/posts.repository';
import { PostsEntity } from './posts.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async createPost(dto: CreatePostDto): Promise<Post | null> {
    const entity = new PostsEntity({
      ...dto,
      extendedLikesInfo: {
        dislikes: [],
        likes: [],
      },
      createdAt: new Date(),
    });

    const { id } = await this.postsRepository.create(entity);

    return entity.setId(id).toView();
  }

  async getPosts(query: GetPostsQuery, dto: { user?: UserData }) {
    const posts = await this.postsRepository.findAll(query);

    return {
      ...posts,
      items: posts.items.map((post) =>
        new PostsEntity(post).setCurrentUser(dto.user).toView(),
      ),
    };
  }

  async getPostById(
    id: string,
    dto?: { user?: UserData },
  ): Promise<Post | null> {
    const postData = await this.postsRepository.findById(id);

    if (!postData) {
      return null;
    }

    return new PostsEntity(postData).setCurrentUser(dto?.user).toView();
  }

  async getPostsByBlog(
    blogId: string,
    query: GetPostsQuery,
    dto: { user?: UserData },
  ) {
    const posts = await this.postsRepository.findAllByBlog(blogId, query);

    return {
      ...posts,
      items: posts.items.map((post) =>
        new PostsEntity(post).setCurrentUser(dto.user).toView(),
      ),
    };
  }

  async updatePost(
    id: string,
    dto: UpdatePostDto,
    user?: UserData,
  ): Promise<Post | null> {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    const entity = new PostsEntity({
      ...existedPost,
      ...dto,
    }).setCurrentUser(user);

    await this.postsRepository.updateById(id, entity);

    return entity.toView();
  }

  async updatePostLikeStatusById(
    id: string,
    dto: UpdatePostLikeStatusDto,
    user?: UserData,
  ): Promise<Post | null> {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    const entity = new PostsEntity({
      ...existedPost,
      extendedLikesInfo: existedPost.extendedLikesInfo,
    })
      .setCurrentUser(user)
      .setLikeStatus(dto.likeStatus);

    await this.postsRepository.updateById(id, entity);

    return entity.toView();
  }

  async deletePostById(id: string): Promise<{ status: 'ok' }> {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    await this.postsRepository.deleteById(id);

    return { status: 'ok' };
  }

  async deleteAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
}
