import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/request.dto';
import { RolesNeeded } from 'src/utils/decorators/permissions.decorator';
import { RoleEnum } from 'src/constants/enum';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RolesNeeded(RoleEnum.Admin)
  async createUser(@Body() createUserRequestDto: CreateUserRequestDto) {
    return await this.userService.createUser(createUserRequestDto);
  }
}
