import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_params: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    return user;
  },
);
