import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateProgrammaticCredentialsRequestDto,
  CreateUserRequestDto,
  DeleteAwsConsoleCredentialsRequestDto,
  UpdateAwsConsoleCredentialsRequestDto,
  UpdateProgrammaticCredentialsRequestDto,
} from './dto/request.dto';
import { User } from 'src/entities/user.entity';
import {
  AwsAccessKeysStatusEnum,
  PermissionEnum,
  RoleEnum,
} from 'src/constants/enum';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AwsConsoleCredentials } from 'src/entities/aws-console-credentials.entity';
import { AwsProgrammaticCredentials } from 'src/entities/aws-programmatic-credentials.entity';
import { Permission } from 'src/entities/permission.entity';

const moduleMocker = new ModuleMocker(global);
const mockFactory = (token: unknown) => {
  if (typeof token === 'function') {
    const mockMetadata = moduleMocker.getMetadata(
      token,
    ) as MockFunctionMetadata<any, any>;
    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
    return new Mock();
  }
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [],
    })
      .useMocker(mockFactory)
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('createUser', () => {
    it('should call userService.createUser and return the created user with a success message', async () => {
      const createUserDto: CreateUserRequestDto = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        role_id: '00d9a69d-599f-4d21-bde7-17675c6db5ef',
      };

      const mockResponse: User = {
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date(),
        deleted_at: new Date(),
        password_hash: 'ajdhaiudhieuhdia',
        role: {
          id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
          name: RoleEnum.Admin,
          permissions: [
            {
              id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
              name: PermissionEnum.CreateAwsCredentials,
            } as unknown as Permission,
          ],
        },
        updated_at: new Date(),
      };

      jest.spyOn(userService, 'createUser').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const result = await userController.createUser(createUserDto);

      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        data: mockResponse,
        message: 'User created successfully',
      });
    });
  });

  describe('createAwsConsoleCredentials', () => {
    const addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto =
      {
        aws_password: 'string',
        aws_username: 'string',
        expiration_time: new Date(),
        is_password_reset_required: false,
      };

    const user: UserBasicInfo = {
      id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
      role: {
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        name: RoleEnum.Admin,
        permissions: [
          {
            id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
            name: PermissionEnum.CreateAwsCredentials,
          },
        ],
      },
      username: 'string',
    };

    it('should call userService.createAwsConsoleCredentials', async () => {
      await userController.createAwsConsoleCredentials(
        addAwsConsoleCredentialsRequestDto,
        user,
      );

      expect(userService.createAwsConsoleCredentials).toHaveBeenCalledWith(
        addAwsConsoleCredentialsRequestDto,
        user,
      );
    });

    it('should return the result of userService.createAwsConsoleCredentials with success message', async () => {
      const serviceResponse: AwsConsoleCredentials = {
        aws_password: 'string',
        aws_username: 'string',
        created_at: new Date(),
        created_by: {
          id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        } as unknown as User,
        updated_by: {
          id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        } as unknown as User,
        deleted_at: new Date(),
        expiration_time: new Date(),
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        updated_at: new Date(),
      };

      jest
        .spyOn(userService, 'createAwsConsoleCredentials')
        .mockResolvedValue(serviceResponse);

      const result = await userController.createAwsConsoleCredentials(
        addAwsConsoleCredentialsRequestDto,
        user,
      );

      expect(result).toEqual({
        data: serviceResponse,
        message: 'AWS console credentials created successfully',
      });
    });
  });

  describe('updateAwsConsoleCredentials', () => {
    const updateAwsConsoleCredentialsRequestDto: UpdateAwsConsoleCredentialsRequestDto =
      {
        aws_username: 'string',
        aws_new_password: 'string',
        aws_new_username: 'string',
        expiration_time: new Date(),
      };

    const user: UserBasicInfo = {
      id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
      role: {
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        name: RoleEnum.Admin,
        permissions: [
          {
            id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
            name: PermissionEnum.CreateAwsCredentials,
          },
        ],
      },
      username: 'string',
    };

    it('should call userService.updateAwsConsoleCredentials', async () => {
      await userController.updateAwsConsoleCredentials(
        updateAwsConsoleCredentialsRequestDto,
        user,
      );

      expect(userService.updateAwsConsoleCredentials).toHaveBeenCalledWith(
        updateAwsConsoleCredentialsRequestDto,
        user,
      );
    });

    it('should return the result of userService.updateAwsConsoleCredentials with success message', async () => {
      const result = await userController.updateAwsConsoleCredentials(
        updateAwsConsoleCredentialsRequestDto,
        user,
      );
      expect(result).toEqual({
        message: 'AWS console credentials updated successfully',
      });
    });
  });

  describe('deleteAwsConsoleCredentials', () => {
    const deleteAwsConsoleCredentialsRequestDto: DeleteAwsConsoleCredentialsRequestDto =
      {
        aws_username: 'string',
      };

    it('should call userService.deleteAwsConsoleCredentials', async () => {
      await userController.deleteAwsConsoleCredentials(
        deleteAwsConsoleCredentialsRequestDto,
      );

      expect(userService.deleteAwsConsoleCredentials).toHaveBeenCalledWith(
        deleteAwsConsoleCredentialsRequestDto,
      );
    });

    it('should return the result of userService.deleteAwsConsoleCredentials with success message', async () => {
      const result = await userController.deleteAwsConsoleCredentials(
        deleteAwsConsoleCredentialsRequestDto,
      );
      expect(result).toEqual({
        data: undefined,
        message: 'AWS console credentials deleted successfully',
      });
    });
  });

  describe('updateProgrammaticCredentials', () => {
    const updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto =
      {
        aws_username: 'string',
        status: AwsAccessKeysStatusEnum.Active,
      };

    const user: UserBasicInfo = {
      id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
      role: {
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        name: RoleEnum.Admin,
        permissions: [
          {
            id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
            name: PermissionEnum.CreateAwsCredentials,
          },
        ],
      },
      username: 'string',
    };

    it('should call userService.updateProgrammaticCredentials', async () => {
      await userController.updateProgrammaticCredentials(
        updateProgrammaticCredentialsRequestDto,
        user,
      );

      expect(userService.updateAwsProgrammaticCredentials).toHaveBeenCalledWith(
        updateProgrammaticCredentialsRequestDto,
        user,
      );
    });

    it('should return the result of userService.updateProgrammaticCredentials with success message', async () => {
      const result = await userController.updateProgrammaticCredentials(
        updateProgrammaticCredentialsRequestDto,
        user,
      );
      expect(result).toEqual({
        data: undefined,
        message: 'AWS programmatic credentials updated successfully',
      });
    });
  });

  describe('createProgrammaticCredentials', () => {
    const createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto =
      {
        aws_username: 'string',
        expiration_time: new Date(),
      };

    const user: UserBasicInfo = {
      id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
      role: {
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        name: RoleEnum.Admin,
        permissions: [
          {
            id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
            name: PermissionEnum.CreateAwsCredentials,
          },
        ],
      },
      username: 'string',
    };

    it('should call userService.createProgrammaticCredentials', async () => {
      await userController.createProgrammaticCredentials(
        createProgrammaticCredentialsRequestDto,
        user,
      );

      expect(userService.createProgrammaticCredentials).toHaveBeenCalledWith(
        createProgrammaticCredentialsRequestDto,
        user,
      );
    });

    it('should return the result of userService.createProgrammaticCredentials with success message', async () => {
      const serviceResponse: AwsProgrammaticCredentials = {
        aws_access_key: 'string',
        aws_secret_key: 'string',
        status: AwsAccessKeysStatusEnum.Active,
        aws_username: 'string',
        created_at: new Date(),
        created_by: {
          id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        } as unknown as User,
        updated_by: {
          id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        } as unknown as User,
        deleted_at: new Date(),
        id: '48d03e9e-6bc5-4ee6-aba8-bf71ba7e1659',
        updated_at: new Date(),
      };

      jest
        .spyOn(userService, 'createProgrammaticCredentials')
        .mockResolvedValue(serviceResponse);

      const result = await userController.createProgrammaticCredentials(
        createProgrammaticCredentialsRequestDto,
        user,
      );
      expect(result).toEqual({
        data: serviceResponse,
        message: 'AWS programmatic credentials created successfully',
      });
    });
  });
});
