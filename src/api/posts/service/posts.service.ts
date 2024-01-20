import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePostParams,
  GetPostsQuery,
  UpdatePostParams,
  UpdatePostLikeStatusParams,
  UserData,
} from './posts.service.types';
import { PostsRepository } from '../repository';
import { PostView, PostsEntity, createPostEntity } from './posts.entity';
import { UsersService } from '../../users';
import { PostsQueryRepository } from '../repository';
import { PaginationList } from 'src/types/common';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  async createPost(
    params: CreatePostParams,
    userId?: string,
  ): Promise<PostView> {
    const entity = createPostEntity({ ...params, authorId: userId });

    const { id } = await this.postsRepository.create(entity.toModel());

    return entity.setId(id).toView();
  }

  async getPosts(
    query: GetPostsQuery,
    dto: { user?: UserData },
  ): Promise<PaginationList<PostView[]>> {
    const posts = await this.postsQueryRepository.findAllPosts(query);
    const bannedUsersIds = await this.usersService.getBannedUsersIds();

    return {
      ...posts,
      items: posts.items.map((post) =>
        new PostsEntity(post)
          .setCurrentUser(dto.user)
          .setBannedUsersIds(bannedUsersIds)
          .toView(),
      ),
    };
  }

  async getPostById(
    id: string,
    dto?: { user?: UserData },
  ): Promise<PostView | null> {
    const postData = await this.postsRepository.findById(id);

    if (!postData) {
      return null;
    }

    const bannedUsersIds = await this.usersService.getBannedUsersIds();

    return new PostsEntity(postData)
      .setCurrentUser(dto?.user)
      .setBannedUsersIds(bannedUsersIds)
      .toView();
  }

  async getPostsByBlog(
    blogId: string,
    query: GetPostsQuery,
    dto: { user?: UserData },
  ): Promise<PaginationList<PostView[]>> {
    const posts = await this.postsQueryRepository.findAllPostsByBlog(
      blogId,
      query,
    );

    return {
      ...posts,
      items: posts.items.map((post) =>
        new PostsEntity(post).setCurrentUser(dto.user).toView(),
      ),
    };
  }

  async updatePost(
    id: string,
    params: UpdatePostParams,
    user?: UserData,
  ): Promise<PostView> {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    if (user && user.id !== existedPost.authorId) {
      throw new ForbiddenException('Forbidden action for update post');
    }

    const entity = new PostsEntity({
      ...existedPost,
      ...params,
    }).setCurrentUser(user);

    await this.postsRepository.updateById(id, entity);

    return entity.toView();
  }

  async updatePostLikeStatusById(
    id: string,
    dto: UpdatePostLikeStatusParams,
    user?: UserData,
  ): Promise<PostView> {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    const entity = new PostsEntity({
      ...existedPost,
      likesInfo: existedPost.likesInfo,
    })
      .setCurrentUser(user)
      .setLikeStatus(dto.likeStatus);

    await this.postsRepository.updateById(id, entity);

    return entity.toView();
  }

  async deletePostById(id: string, user?: UserData): Promise<{ status: 'ok' }> {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    if (user && user.id !== existedPost.authorId) {
      throw new ForbiddenException('Forbidden action for delete post');
    }

    await this.postsRepository.deleteById(id);

    return { status: 'ok' };
  }

  async deleteAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
}
