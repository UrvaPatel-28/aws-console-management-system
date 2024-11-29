import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateProgrammaticCredentialsRequestDto,
  CreateUserRequestDto,
} from './dto/request.dto';
import { RolesNeeded } from 'src/utils/decorators/permissions.decorator';
import { RoleEnum } from 'src/constants/enum';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { User } from 'src/utils/decorators/user.decorator';

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

  @Post('create-aws-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  async addUserAwsTemporaryCredentials(
    @Body()
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    return await this.userService.addUserAwsTemporaryCredentials(
      addAwsConsoleCredentialsRequestDto,
      user,
    );
  }

  @Post('create-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader)
  async createProgrammaticCredentials(
    @Body()
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    return await this.userService.createProgrammaticCredentials(
      createProgrammaticCredentialsRequestDto,
      user,
    );
  }
}
