import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserBasicInfo } from '../interface/auth.type';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request & {
      user: UserBasicInfo;
    } = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
