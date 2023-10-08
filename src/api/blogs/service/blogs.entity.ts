type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
};

type Props = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership?: boolean;
  createdAt: Date;
  blogOwnerInfo?: BlogOwnerInfo | null;
  banInfo: BanInfo;
};

export class BlogsEntity {
  public name: string;
  public description: string;
  public websiteUrl: string;
  public isMembership: boolean;
  public blogOwnerInfo: BlogOwnerInfo | null;
  public banInfo: BanInfo;
  public createdAt?: Date;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public fillEntity(props: Props) {
    this.name = props.name;
    this.description = props.description;
    this.isMembership = props.isMembership || false;
    this.websiteUrl = props.websiteUrl;
    this.createdAt = props.createdAt;
    this.blogOwnerInfo = props.blogOwnerInfo || null;
    this.banInfo = props.banInfo;
  }

  public toModel() {
    if (!this.createdAt || !this.banInfo) {
      throw new Error('Incorrect model data');
    }

    return {
      name: this.name,
      description: this.description,
      isMembership: this.isMembership,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      blogOwnerInfo: this.blogOwnerInfo,
      banInfo: this.banInfo,
    };
  }
}
