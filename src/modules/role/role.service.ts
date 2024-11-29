import { Injectable } from '@nestjs/common';
import { RoleQueryBuilder } from './role.query.builder';
import { AddRoleRequestDto } from './dto/request.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleQueryBuilder: RoleQueryBuilder) {}

  async addRole(addRoleRequestDto: AddRoleRequestDto) {
    return await this.roleQueryBuilder.addRole(addRoleRequestDto);
  }
}
