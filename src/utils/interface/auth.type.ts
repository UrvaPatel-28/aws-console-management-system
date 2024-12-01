import { UUID } from 'crypto';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';

export type UserBasicInfo = {
  id: UUID;
  username: string;
  role: {
    id: UUID;
    name: RoleEnum;
    permissions: {
      id: UUID;
      name: PermissionEnum;
    }[];
  };
};
