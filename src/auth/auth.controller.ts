import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllowUnauthorized } from 'src/utils/decorators/allow-unauthorized.decorator';
import { LocalAuthGuard } from 'src/utils/guards/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowUnauthorized()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login() {}
}
