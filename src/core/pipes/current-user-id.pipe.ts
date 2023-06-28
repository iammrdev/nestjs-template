import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (_params: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    return user?.id;
  },
);
