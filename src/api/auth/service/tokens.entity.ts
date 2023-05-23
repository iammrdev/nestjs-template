import { compare, genSalt, hash } from 'bcrypt';

type Props = {
  userId: string;
  exp: Date;
};

export class TokensEntity {
  public userId: string;
  public hash: string;
  public exp: Date;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public async setToken(token: string) {
    const salt = await genSalt(10);
    this.hash = await hash(token, salt);

    return this;
  }

  public async compareToken(token: string): Promise<boolean> {
    return compare(token, this.hash);
  }

  public fillEntity(props: Props) {
    this.userId = props.userId;
    this.exp = props.exp;
  }

  public toObject() {
    return {
      userId: this.userId,
      hash: this.hash,
      exp: this.exp,
    };
  }
}
