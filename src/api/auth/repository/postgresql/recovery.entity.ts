import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recovery')
export class RecoveryEntity {
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
  code: string;

  @Column()
  iat: Date;

  @Column()
  exp: Date;
}
