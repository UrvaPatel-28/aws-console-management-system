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

  async addRole(addRoleRequestDto: AddRoleRequestDto) {
    const { permissions, name } = addRoleRequestDto;
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // resolve and upsert permissions
        const resolvedPermissions = await Promise.all(
          permissions.map(async (permissionName) => {
            await transactionalEntityManager.upsert(
              Permission,
              { name: permissionName },
              { conflictPaths: ['name'] },
            );
            // fetch the permission entity to associate with the role
            return transactionalEntityManager.findOne(Permission, {
              where: { name: permissionName },
            });
          }),
        );

        // create or update the role
        let role = await transactionalEntityManager.findOne(Role, {
          where: { name },
          relations: ['permissions'],
        });

        if (!role) {
          // if role does not exist, create a new role
          role = transactionalEntityManager.create(Role, {
            name,
            permissions: resolvedPermissions,
          });
        } else {
          // update the role's permissions if it already exists
          role.permissions = resolvedPermissions;
        }

        // save the role with its permissions (updates the role_permission_link table)
        const savedRole = await transactionalEntityManager.save(role);

        return savedRole;
      },
    );
  }
}
