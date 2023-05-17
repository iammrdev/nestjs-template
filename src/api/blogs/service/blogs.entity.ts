type Props = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership?: boolean;
  createdAt?: Date;
};

export class BlogsEntity {
  public name: string;
  public description: string;
  public websiteUrl: string;
  public isMembership: boolean;
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
  }

  public toObject() {
    return {
      name: this.name,
      description: this.description,
      isMembership: this.isMembership,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
    };
  }
}
