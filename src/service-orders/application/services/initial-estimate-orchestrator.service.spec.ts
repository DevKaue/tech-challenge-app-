import { Test, TestingModule } from '@nestjs/testing';
import InitialEstimateOrchestratorService from './initial-estimate-orchestrator.service';
import InitialEstimateOrchestratorInterface from '@service-orders/application/contracts/initial-estimate-orchestrator.interface';
import { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';
import { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

describe('InitialEstimateOrchestratorService', () => {
  let service: InitialEstimateOrchestratorService;
  let createEstimateUseCase: jest.Mocked<CreateEstimateUseCase>;
  let addEstimateItemUseCase: jest.Mocked<AddEstimateItemUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InitialEstimateOrchestratorInterface,
          useFactory: (
            createEstimateUseCase: CreateEstimateUseCase,
            addEstimateItemUseCase: AddEstimateItemUseCase,
          ) =>
            new InitialEstimateOrchestratorService(
              createEstimateUseCase,
              addEstimateItemUseCase,
            ),
          inject: [CreateEstimateUseCase, AddEstimateItemUseCase],
        },
        {
          provide: CreateEstimateUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AddEstimateItemUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(InitialEstimateOrchestratorInterface);
    createEstimateUseCase = module.get(CreateEstimateUseCase);
    addEstimateItemUseCase = module.get(AddEstimateItemUseCase);
  });

  it('returns null and does nothing when there are no items', async () => {
    const result = await service.execute({
      orderId: 'order-1',
      services: [],
      parts: [],
    });

    expect(result).toBeNull();
    expect(createEstimateUseCase.execute).not.toHaveBeenCalled();
    expect(addEstimateItemUseCase.execute).not.toHaveBeenCalled();
  });

  it('creates an estimate and adds services and parts', async () => {
    createEstimateUseCase.execute.mockResolvedValue({ id: 'est-1' } as any);
    addEstimateItemUseCase.execute.mockResolvedValue({} as any);

    const result = await service.execute({
      orderId: 'order-1',
      services: [{ referenceId: 'svc-1', quantity: 1, description: 'Troca' }],
      parts: [{ referenceId: 'part-1', quantity: 2 }],
    });

    expect(createEstimateUseCase.execute).toHaveBeenCalledWith('order-1');
    expect(addEstimateItemUseCase.execute).toHaveBeenCalledTimes(2);
    expect(addEstimateItemUseCase.execute).toHaveBeenNthCalledWith(1, 'est-1', {
      itemType: ServiceOrderItemType.SERVICE,
      referenceId: 'svc-1',
      quantity: 1,
      description: 'Troca',
    });
    expect(addEstimateItemUseCase.execute).toHaveBeenNthCalledWith(2, 'est-1', {
      itemType: ServiceOrderItemType.PART,
      referenceId: 'part-1',
      quantity: 2,
      description: undefined,
    });
    expect(result).toEqual({ id: 'est-1' });
  });

  it('creates an estimate when only services are provided', async () => {
    createEstimateUseCase.execute.mockResolvedValue({ id: 'est-1' } as any);

    await service.execute({
      orderId: 'order-1',
      services: [{ referenceId: 'svc-1', quantity: 1 }],
      parts: [],
    });

    expect(createEstimateUseCase.execute).toHaveBeenCalledWith('order-1');
    expect(addEstimateItemUseCase.execute).toHaveBeenCalledTimes(1);
    expect(addEstimateItemUseCase.execute).toHaveBeenCalledWith('est-1', {
      itemType: ServiceOrderItemType.SERVICE,
      referenceId: 'svc-1',
      quantity: 1,
      description: undefined,
    });
  });

  it('creates an estimate when only parts are provided', async () => {
    createEstimateUseCase.execute.mockResolvedValue({ id: 'est-1' } as any);

    await service.execute({
      orderId: 'order-1',
      services: [],
      parts: [{ referenceId: 'part-1', quantity: 3 }],
    });

    expect(createEstimateUseCase.execute).toHaveBeenCalledWith('order-1');
    expect(addEstimateItemUseCase.execute).toHaveBeenCalledTimes(1);
    expect(addEstimateItemUseCase.execute).toHaveBeenCalledWith('est-1', {
      itemType: ServiceOrderItemType.PART,
      referenceId: 'part-1',
      quantity: 3,
      description: undefined,
    });
  });
});
