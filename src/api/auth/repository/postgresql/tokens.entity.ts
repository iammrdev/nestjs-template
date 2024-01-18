import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tokens')
export class TokensEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  ip: string;

  @Column()
  deviceId: string;

  @Column()
  title: string;

  @Column()
  refreshToken: string;

  @Column()
  iat: Date;

  @Column()
  exp: Date;
}
