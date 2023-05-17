import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePostDto,
  GetPostsQuery,
  UpdatePostDto,
} from './posts.service.interface';
import { Post } from '../../../types/Posts';
import { PostsRepository } from '../repository/posts.repository';
import { PostsEntity } from './posts.entity';
import { LikeStatus } from '../../../types/likes';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async createPost(dto: CreatePostDto): Promise<Post | null> {
    const entity = new PostsEntity({
      ...dto,
      createdAt: new Date(),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    });

    return this.postsRepository.create(entity);
  }

  async getPosts(query: GetPostsQuery) {
    return this.postsRepository.findAll(query);
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.postsRepository.findById(id);
  }

  async getPostsByBlog(blogId: string, query: GetPostsQuery) {
    return this.postsRepository.findAllByBlog(blogId, query);
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<Post | null> {
    const existedPost = await this.getPostById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    const entity = new PostsEntity({
      ...dto,
      extendedLikesInfo: existedPost.extendedLikesInfo,
    });

    return this.postsRepository.updateById(id, entity);
  }

  async deletePostById(id: string): Promise<{ status: 'ok' }> {
    await this.postsRepository.deleteById(id);

    return { status: 'ok' };
  }

  async deleteAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
}
