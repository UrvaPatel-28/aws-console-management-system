import { UUID } from 'crypto';
import { RoleEnum } from 'src/constants/enum';

export type UserBasicInfo = {
  id: UUID;
  username: string;
  role: {
    id: UUID;
    name: RoleEnum;
  };
  team_leader: UUID | null;
};
