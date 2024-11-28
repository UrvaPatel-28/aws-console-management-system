import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';
import { CreateUserRequestDto } from './dto/request.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UserQueryBuilder {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createUser(createUserRequestDto: CreateUserRequestDto) {
    const { email, password, role, team_leader, username } =
      createUserRequestDto;

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const hashedPassword = await hash(password, 10);

      const user = transactionalEntityManager.create(User, {
        email,
        password_hash: hashedPassword,
        role: { id: role },
        team_leader: { id: team_leader },
        username,
      });

      await this.dataSource.manager.save(user);
    });
  }

  async findUserByUserName(username: string) {
    return this.dataSource.manager.findOne(User, { where: { username } });
  }
}
