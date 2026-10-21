import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceOrderUseCase } from './create-service-order.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomerManagementInterface from '@/common/application/contracts/customer-management.interface';
import UnitOfWorkServiceInterface from '@/common/application/contracts/unit-of-work-service.interface';
import InitialEstimateOrchestratorInterface from '@service-orders/application/contracts/initial-estimate-orchestrator.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';

describe('CreateServiceOrderUseCase', () => {
  let useCase: CreateServiceOrderUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let customerManagement: jest.Mocked<CustomerManagementInterface>;
  let initialEstimateOrchestrator: jest.Mocked<InitialEstimateOrchestratorInterface>;
  let unitOfWork: {
    runInTransaction: jest.Mock;
    client: any;
  };

  const mockOrder: any = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED,
    mileage: null,
    notes: null,
    mechanicId: null,
    mechanic: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: {
      id: 'client-1',
      document: '123',
      email: null,
      phone: null,
      name: 'Maria',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    vehicle: {
      id: 'vehicle-1',
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      customerId: 'client-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    unitOfWork = {
      runInTransaction: jest.fn((work: () => Promise<unknown>) => work()),
      client: {},
    };
    initialEstimateOrchestrator = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateServiceOrderUseCase,
          useFactory: (
            repository: ServiceOrdersRepositoryInterface,
            customerManagement: CustomerManagementInterface,
            initialEstimateOrchestrator: InitialEstimateOrchestratorInterface,
            unitOfWork: UnitOfWorkServiceInterface,
          ) =>
            new CreateServiceOrderUseCase(
              repository,
              customerManagement,
              initialEstimateOrchestrator,
              unitOfWork,
            ),
          inject: [
            ServiceOrdersRepositoryInterface,
            CustomerManagementInterface,
            InitialEstimateOrchestratorInterface,
            UnitOfWorkServiceInterface,
          ],
        },
        {
          provide: UnitOfWorkServiceInterface,
          useValue: unitOfWork,
        },
        {
          provide: InitialEstimateOrchestratorInterface,
          useValue: initialEstimateOrchestrator,
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            create: jest.fn(),
            createStatusHistory: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: CustomerManagementInterface,
          useValue: {
            findCustomerById: jest.fn(),
            findVehicleById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(CreateServiceOrderUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
    customerManagement = module.get(CustomerManagementInterface);
    initialEstimateOrchestrator = module.get(
      InitialEstimateOrchestratorInterface,
    );
  });

  it('should create a service order when the vehicle belongs to the client', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
      document: '123',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'client-1',
    } as any);
    repository.create.mockResolvedValue(mockOrder);
    repository.createStatusHistory.mockResolvedValue({} as any);
    repository.findById.mockResolvedValue(mockOrder);

    const result = await useCase.execute({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
    });

    expect(repository.create).toHaveBeenCalledWith({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      status: ServiceOrderStatus.RECEIVED,
      mileage: null,
      notes: null,
    });
    expect(initialEstimateOrchestrator.execute).toHaveBeenCalledWith({
      orderId: 'order-1',
      services: [],
      parts: [],
    });
    expect(result).toHaveProperty('id', 'order-1');
    expect(result).toHaveProperty('customer', {
      id: 'client-1',
      name: 'Maria',
    });
  });

  it('should persist mileage and notes when provided', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'client-1',
    } as any);
    repository.create.mockResolvedValue(mockOrder);
    repository.createStatusHistory.mockResolvedValue({} as any);
    repository.findById.mockResolvedValue(mockOrder);

    await useCase.execute({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      mileage: 45200,
      notes: 'Barulho no motor',
    });

    expect(repository.create).toHaveBeenCalledWith({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      status: ServiceOrderStatus.RECEIVED,
      mileage: 45200,
      notes: 'Barulho no motor',
    });
  });

  it('should delegate initial estimate assembly to the orchestrator when services and parts are provided', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'client-1',
    } as any);
    repository.create.mockResolvedValue(mockOrder);
    repository.createStatusHistory.mockResolvedValue({} as any);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.IN_DIAGNOSIS,
    });
    initialEstimateOrchestrator.execute.mockResolvedValue({
      id: 'est-1',
    } as any);
    repository.findById.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.WAITING_APPROVAL,
      estimates: [
        {
          id: 'est-1',
          serviceOrderId: 'order-1',
          status: 'PENDING',
          totalAmount: 0,
          validUntil: null,
          approvedAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        },
      ],
    });

    const result = await useCase.execute({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      services: [{ referenceId: 'svc-1', quantity: 1 }],
      parts: [{ referenceId: 'part-1', quantity: 2 }],
    });

    expect(initialEstimateOrchestrator.execute).toHaveBeenCalledWith({
      orderId: 'order-1',
      services: [{ referenceId: 'svc-1', quantity: 1 }],
      parts: [{ referenceId: 'part-1', quantity: 2 }],
    });
    expect(repository.create).toHaveBeenCalledWith({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      status: ServiceOrderStatus.RECEIVED,
      mileage: null,
      notes: null,
    });
    expect(repository.createStatusHistory).toHaveBeenCalledWith({
      serviceOrderId: 'order-1',
      previousStatus: ServiceOrderStatus.RECEIVED,
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
    });
    expect(result).toHaveProperty('id', 'order-1');
    expect(result).toHaveProperty(
      'status',
      ServiceOrderStatus.WAITING_APPROVAL,
    );
  });

  it('should throw when the vehicle does not exist', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue(null);

    await expect(
      useCase.execute({ customerId: 'client-1', vehicleId: 'x' }),
    ).rejects.toThrow(VehicleNotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw when the customer does not exist', async () => {
    customerManagement.findCustomerById.mockResolvedValue(null);

    await expect(
      useCase.execute({ customerId: 'no-client', vehicleId: 'vehicle-1' }),
    ).rejects.toThrow(CustomerNotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw when the vehicle does not belong to the client', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'another-client',
    } as any);

    await expect(
      useCase.execute({ customerId: 'client-1', vehicleId: 'vehicle-1' }),
    ).rejects.toThrow(VehicleOwnerMismatchException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
