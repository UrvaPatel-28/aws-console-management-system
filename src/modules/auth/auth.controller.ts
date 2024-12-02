import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/utils/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { User } from 'src/utils/decorators/user.decorator';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { AllowUnauthorized } from 'src/utils/decorators/allow-unauthorized.decorator';
import { LoginRequestDto } from './dto/request.dto';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @AllowUnauthorized()
  @Post('login')
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @User() user: UserBasicInfo,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...otherInfo } = loginRequestDto;

    const data = await this.authService.login({ ...otherInfo, ...user });
    return {
      data,
      message: 'Login successfully',
    };
  }
}
