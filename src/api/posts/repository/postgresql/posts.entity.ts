import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '../posts.model.types';

@Entity('posts')
export class PostsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  public title: string;

  @Column({ collation: 'C' })
  public shortDescription: string;

  @Column({ collation: 'C' })
  public content: string;

  @Column()
  public blogId: string;

  @Column({ collation: 'C' })
  public blogName: string;

  @Column({ nullable: true })
  public authorId: string;

  @Column({ collation: 'C' })
  public status: Status;

  @Column({ nullable: true })
  public likesInfoLikes: string;

  @Column({ nullable: true })
  public likesInfoDislikes: string;

  @Column()
  public createdAt: Date;
}
