import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { UserQueryBuilder } from '../user/user.query.builder';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userQueryBuilder: UserQueryBuilder,
  ) {}

  /**
   * Validates a user's email and password.
   *
   * @param email - The email provided by the user during login.
   * @param password - The password provided by the user during login.
   * @returns The user's basic information (excluding the password hash) if validation succeeds.
   * @throws UnauthorizedException if the email or password is incorrect.
   */
  async validateUser(email: string, password: string) {
    // Find the user by their email in the database
    const user = await this.userQueryBuilder.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }
    // Extract the password hash and other user details
    const { password_hash, ...result } = user;

    // Compare the provided password with the stored hash
    const isMatched = await compare(password, password_hash);
    if (!isMatched) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }

    // Return user details (excluding the password hash) if validation is successfully
    return result;
  }

  /**
   * Generates a JWT access token for a validated user during login.
   *
   * @param loginRequestDto - Basic user information required for generating the token.
   * @returns An object containing the user information and a signed JWT access token.
   */
  async login(loginRequestDto: UserBasicInfo) {
    return {
      ...loginRequestDto,
      access_token: this.jwtService.sign({ ...loginRequestDto }), // Generate a JWT toekn with the user details
    };
  }
}
