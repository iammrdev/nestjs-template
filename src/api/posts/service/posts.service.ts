import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePostDto,
  GetPostsQuery,
  UpdatePostDto,
  UpdatePostLikeStatusDto,
  UserData,
} from './posts.service.interface';
import { PostsRepository } from '../repository/posts.repository';
import { PostsEntity, createPostEntity } from './posts.entity';
import { UsersService } from '../../users';
import { PostsQueryRepository } from '../repository/posts.query.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  async createPost(dto: CreatePostDto, user?: UserData) {
    const entity = createPostEntity({ ...dto, userId: user?.id });

    const { id } = await this.postsRepository.create(entity.toModel());

    return entity.setId(id).toView();
  }

  async getPosts(query: GetPostsQuery, dto: { user?: UserData }) {
    const posts = await this.postsQueryRepository.findAll(query);
    const bannedUsersIds = await this.usersService.getUsersBanned();

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

  async getPostById(id: string, dto?: { user?: UserData }) {
    const postData = await this.postsRepository.findById(id);

    if (!postData) {
      return null;
    }

    const bannedUsersIds = await this.usersService.getUsersBanned();

    return new PostsEntity(postData)
      .setCurrentUser(dto?.user)
      .setBannedUsersIds(bannedUsersIds)
      .toView();
  }

  async getPostsByBlog(
    blogId: string,
    query: GetPostsQuery,
    dto: { user?: UserData },
  ) {
    const posts = await this.postsQueryRepository.findAllByBlog(blogId, query);

    return {
      ...posts,
      items: posts.items.map((post) =>
        new PostsEntity(post).setCurrentUser(dto.user).toView(),
      ),
    };
  }

  async updatePost(id: string, dto: UpdatePostDto, user?: UserData) {
    const existedPost = await this.postsRepository.findById(id);

    if (!existedPost) {
      throw new NotFoundException('Post is not found');
    }

    if (user && user.id !== existedPost.authorId) {
      throw new ForbiddenException('Forbidden action for update post');
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
  ) {
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
