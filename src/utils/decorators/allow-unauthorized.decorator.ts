import { SetMetadata } from '@nestjs/common';

export const ALLOW_UNAUTHORIZED = 'ALLOW_UNAUTHORIZED';
export const AllowUnauthorized = () => SetMetadata(ALLOW_UNAUTHORIZED, true);
