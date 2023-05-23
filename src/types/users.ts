type Confirmation = {
  status: boolean;
  code: string;
  expiration: Date;
  activation: Date | null;
};

export type User = {
  id: string;
  login: string;
  email: string;
  confirmation: Confirmation;
  createdAt: Date;
};
