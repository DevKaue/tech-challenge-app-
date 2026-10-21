import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { StartDiagnosisUseCase } from './startDiagnosis.use-case';

describe('StartDiagnosisUseCase', () => {
  let useCase: StartDiagnosisUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StartDiagnosisUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new StartDiagnosisUseCase(repository),
          inject: [ServiceOrdersRepositoryInterface],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(StartDiagnosisUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  describe('startDiagnosis', () => {
    it('should move to IN_DIAGNOSIS', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.update.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      const result = await useCase.startDiagnosis('order-1', {
        diagnosis: 'Checking engine',
      });

      expect(repository.update).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({ status: ServiceOrderStatus.IN_DIAGNOSIS }),
      );
      expect(result).toBeDefined();
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.startDiagnosis('invalid', { diagnosis: 'test' }),
      ).rejects.toThrow(ServiceOrderNotFoundException);
    });

    it('should throw when status is invalid', async () => {
      repository.findById.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      });

      await expect(
        useCase.startDiagnosis('order-1', { diagnosis: 'test' }),
      ).rejects.toThrow(InvalidStatusTransitionException);
    });
  });
});
