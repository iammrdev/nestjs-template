type BlogOwnerInfo = {
  userId: string;
  userLogin: string;
};

type Props = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership?: boolean;
  createdAt?: Date;
  blogOwnerInfo?: BlogOwnerInfo;
};

export class BlogsEntity {
  public name: string;
  public description: string;
  public websiteUrl: string;
  public isMembership: boolean;
  public createdAt?: Date;
  public blogOwnerInfo?: BlogOwnerInfo;

  constructor(props: Props) {
    this.fillEntity(props);
  }

  public fillEntity(props: Props) {
    this.name = props.name;
    this.description = props.description;
    this.isMembership = props.isMembership || false;
    this.websiteUrl = props.websiteUrl;
    this.createdAt = props.createdAt;
    this.blogOwnerInfo = props.blogOwnerInfo;
  }

  public setOwnerInfo(blogOwnerInfo?: BlogOwnerInfo) {
    this.blogOwnerInfo = blogOwnerInfo;

    return this;
  }

  public toObject() {
    return {
      name: this.name,
      description: this.description,
      isMembership: this.isMembership,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      blogOwnerInfo: this.blogOwnerInfo,
    };
  }
}
