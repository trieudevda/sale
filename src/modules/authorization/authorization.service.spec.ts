import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorizationService } from './authorization.service';
import { Permission } from './entities/permissions.entity';
import { Role } from './entities/roles.entity';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  const roleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const permissionRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a custom role with the requested permissions', async () => {
    const permission = { id: 1, isActive: true } as Permission;
    const role = {
      id: '10',
      code: 'CASHIER',
      permissions: [permission],
    } as Role;
    roleRepository.findOne.mockResolvedValue(null);
    permissionRepository.find.mockResolvedValue([permission]);
    roleRepository.create.mockReturnValue(role);
    roleRepository.save.mockResolvedValue(role);

    await expect(
      service.create({
        code: 'CASHIER',
        name: 'Cashier',
        permissionIds: [1],
      }),
    ).resolves.toBe(role);
    expect(roleRepository.create).toHaveBeenCalledWith({
      code: 'CASHIER',
      name: 'Cashier',
      source: 'custom',
      permissions: [permission],
    });
  });

  it('rejects permission IDs that are missing or inactive', async () => {
    roleRepository.findOne.mockResolvedValue(null);
    permissionRepository.find.mockResolvedValue([]);

    await expect(
      service.create({
        code: 'CASHIER',
        name: 'Cashier',
        permissionIds: [99],
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'INVALID_PERMISSION_IDS',
        permissionIds: [99],
      },
    });
    expect(roleRepository.save).not.toHaveBeenCalled();
  });
});
