import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/utils/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { User } from 'src/utils/decorators/user.decorator';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { AllowUnauthorized } from 'src/utils/decorators/allow-unauthorized.decorator';
import { LoginRequestDto } from './dto/request.dto';

/**
 * Authentication Controller
 * Handles user authentication-related operations such as login.
 */
@Controller('auth')
@ApiBearerAuth() // Add bearer token authentication in Swagger documentation.
@ApiTags('Authentication') // Groups the endpoints under the "Authentication" tag in Swagger documentation.
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User login endpoint.
   * @param loginRequestDto - Contains the email and password for login.
   * @param user - Injected user object in request from the `LocalAuthGuard`.
   * @returns A success message and user's information.
   */
  @UseGuards(LocalAuthGuard) // Uses the `LocalAuthGuard` to validate credentials before invoking the handler.
  @AllowUnauthorized() // Allows access without a token; handled by the guard instead.
  @Post('login')
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @User() user: UserBasicInfo, // Custom decorator to inject authenticated user information.
  ) {
    // Destructure the login request to remove the password before processing.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...otherInfo } = loginRequestDto;

    // Passes the user info to the AuthService's login method and generates a token or session.
    const data = await this.authService.login({ ...otherInfo, ...user });

    // Returns a success response with the token, user info and a message.
    return {
      data,
      message: 'Login successfully',
    };
  }
}
