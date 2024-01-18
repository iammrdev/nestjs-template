import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  login: string;

  @Column({ collation: 'C' })
  email: string;

  @Column({ collation: 'C' })
  passwordHash: string;

  @Column()
  confirmationStatus: boolean;

  @Column()
  confirmationCode: string;

  @Column()
  confirmationExpiration: Date;

  @Column({ nullable: true })
  confirmationActivation: Date;

  @Column()
  banInfoIsBanned: boolean;

  @Column({ nullable: true })
  banInfoBanDate: Date;

  @Column({ nullable: true })
  banInfoBanReason: string;

  @Column()
  createdAt: Date;
}
