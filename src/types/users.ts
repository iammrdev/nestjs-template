type Confirmation = {
  status: boolean;
  code: string;
  expiration: Date;
  activation: Date | null;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
};

export type User = {
  id: string;
  login: string;
  email: string;
  banInfo: BanInfo;
  confirmation: Confirmation;
  createdAt: Date;
};
