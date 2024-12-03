import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AddRoleRequestDto } from './dto/request.dto';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';

@Injectable()
export class RoleQueryBuilder {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Adds a new role along with its associated permissions.
   * @param addRoleRequestDto - DTO containing the role name and permissions to be added.
   * @returns The saved role entity with its associated permissions.
   */
  async addRole(addRoleRequestDto: AddRoleRequestDto) {
    const { permissions, name } = addRoleRequestDto;
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // Resolve and upsert permissions
        const resolvedPermissions: Permission[] = [];
        for (const permissionName of permissions) {
          // Check if the permission already exists in the database
          let permission = await transactionalEntityManager.findOne(
            Permission,
            {
              where: { name: permissionName },
            },
          );

          // If the permission does not exist, create and save it
          if (!permission) {
            permission = transactionalEntityManager.create(Permission, {
              name: permissionName,
            });
          }

          resolvedPermissions.push(permission);
        }

        // Check if the role already exists
        let role = await transactionalEntityManager.findOne(Role, {
          where: { name },
          relations: ['permissions'],
        });

        if (!role) {
          // If the role does not exist, create a new one
          role = transactionalEntityManager.create(Role, {
            name,
            permissions: resolvedPermissions,
          });
        } else {
          // Update the permissions of the existing role
          role.permissions = resolvedPermissions;
        }

        // Save the role along with its permissions (updates the role_permission_link table)
        const savedRole = await transactionalEntityManager.save(role);

        return savedRole;
      },
    );
  }

  /**
   * Fetches all roles from the database.
   * @returns A list of all roles.
   */
  async getRoles() {
    return await this.dataSource.manager.find(Role);
  }

  /**
   * Fetches all permissions from the database.
   * @returns A list of all permissions.
   */
  async getPermissions() {
    return await this.dataSource.manager.find(Permission);
  }
}
