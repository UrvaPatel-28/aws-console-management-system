import { Injectable } from '@nestjs/common';
import { RoleQueryBuilder } from './role.query.builder';
import { AddRoleRequestDto } from './dto/request.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleQueryBuilder: RoleQueryBuilder) {}

  /**
   * Adds a new role.
   * @param addRoleRequestDto - DTO containing details of the role to add.
   */
  async addRole(addRoleRequestDto: AddRoleRequestDto) {
    return await this.roleQueryBuilder.addRole(addRoleRequestDto);
  }

  /**
   * Retrieves a list of all roles with their permissions.
   */
  async getRoles() {
    return await this.roleQueryBuilder.getRoles();
  }

  /**
   * Retrieves a list of all permissions available in the system.
   */
  async getPermissions() {
    return await this.roleQueryBuilder.getPermissions();
  }
}
