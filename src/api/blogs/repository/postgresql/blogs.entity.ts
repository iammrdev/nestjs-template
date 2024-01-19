import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blogs')
export class BlogsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  public name: string;

  @Column({ collation: 'C' })
  public description: string;

  @Column({ collation: 'C' })
  public websiteUrl: string;

  @Column()
  public isMembership: boolean;

  @Column({ nullable: true })
  public blogOwnerInfoUserId: string;

  @Column({ collation: 'C', nullable: true })
  public blogOwnerInfoUserLogin: string;

  @Column({ default: false })
  public banInfoIsBanned: boolean;

  @Column({ nullable: true })
  public banInfoBanDate: Date;

  @Column()
  public createdAt: Date;
}
