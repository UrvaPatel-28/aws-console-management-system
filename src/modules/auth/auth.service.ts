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

  async validateUser(email: string, password: string) {
    const user = await this.userQueryBuilder.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }
    const { password_hash, ...result } = user;

    const isMatched = await compare(password, password_hash);
    if (!isMatched) {
      throw new UnauthorizedException('Incorrect Email or Password');
    }
    return result;
  }

  async login(loginRequestDto: UserBasicInfo) {
    return {
      ...loginRequestDto,
      access_token: this.jwtService.sign({ ...loginRequestDto }),
    };
  }
}
