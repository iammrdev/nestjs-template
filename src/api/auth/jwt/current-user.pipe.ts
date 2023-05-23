import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  id: string;
  email: string;
}

export const CurrentUserId = createParamDecorator(
  (_params: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    return user.sub;
  },
);

export const CurrentUser = createParamDecorator(
  (_params: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    return user;
  },
);
