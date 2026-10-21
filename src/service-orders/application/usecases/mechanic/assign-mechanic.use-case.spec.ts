import { Test, TestingModule } from '@nestjs/testing';
import { AssignMechanicUseCase } from './assign-mechanic.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { UserNotMechanicException } from '@service-orders/domain/exceptions/user-not-mechanic.exception';

describe('AssignMechanicUseCase', () => {
  let useCase: AssignMechanicUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let userRepository: { findById: jest.Mock };

  const mockOrder: any = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED,
    mileage: null,
    notes: null,
    mechanicId: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: {
      id: 'client-1',
      document: '123',
      email: null,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    vehicle: {
      id: 'vehicle-1',
      plate: 'ABC-123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      customerId: 'client-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    mechanic: null,
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AssignMechanicUseCase,
          useFactory: (
            repository: ServiceOrdersRepositoryInterface,
            userRepository: { findById: jest.Mock },
          ) => new AssignMechanicUseCase(repository, userRepository),
          inject: [ServiceOrdersRepositoryInterface, USER_REPOSITORY],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get(AssignMechanicUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should assign mechanic', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'John',
      email: 'john@oficina.test',
      role: 'MECHANIC',
    });
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      mechanicId: 'user-1',
    });

    const result = await useCase.execute('order-1', {
      mechanicId: 'user-1',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ mechanicId: 'user-1' }),
    );
    expect(result).toBeDefined();
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('invalid', { mechanicId: 'user-1' }),
    ).rejects.toThrow(ServiceOrderNotFoundException);
  });

  it('should throw if user not found', async () => {
    repository.findById.mockResolvedValue(mockOrder);
    userRepository.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('order-1', { mechanicId: 'ghost' }),
    ).rejects.toThrow(UserNotMechanicException);
  });

  it('should throw if user is not a mechanic', async () => {
    repository.findById.mockResolvedValue(mockOrder);
    userRepository.findById.mockResolvedValue({
      id: 'user-2',
      name: 'Anne',
      email: 'anne@oficina.test',
      role: 'ATTENDANT',
    });
    await expect(
      useCase.execute('order-1', { mechanicId: 'user-2' }),
    ).rejects.toThrow(UserNotMechanicException);
  });
});
