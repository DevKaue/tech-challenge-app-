import DomainException from '@service-orders/catalog/domain/exceptions/domain.exception';
import { CreateServiceCatalogUseCase } from './create-service-catalog.use-case';

describe('CreateServiceCatalogUseCase', () => {
  const buildRepo = () => ({
    create: jest.fn(),
  });

  it('creates a service', async () => {
    const repo = buildRepo();
    const useCase = new CreateServiceCatalogUseCase(repo as any);

    const dto = await useCase.execute({
      name: 'Alinhamento',
      description: 'Alinhamento e balanceamento',
      price: 120,
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(dto.name).toBe('Alinhamento');
    expect(dto.price).toBe(120);
  });

  it('rejects a service with negative price', async () => {
    const repo = buildRepo();
    const useCase = new CreateServiceCatalogUseCase(repo as any);

    await expect(useCase.execute({ name: 'X', price: -1 })).rejects.toThrow(
      DomainException,
    );
  });
});
