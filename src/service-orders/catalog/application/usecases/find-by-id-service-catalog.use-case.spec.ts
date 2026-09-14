import Service from '@service-orders/catalog/domain/entities/service.entity';
import { FindByIdServiceCatalogUseCase } from './find-by-id-service-catalog.use-case';
import ServiceNotFoundException from '../exceptions/service-not-found.exception';

const buildService = () =>
  new Service({ id: 'svc-1', name: 'Troca de óleo', price: 150 });

describe('FindByIdServiceCatalogUseCase', () => {
  const buildRepo = () => ({
    findById: jest.fn(),
  });

  it('finds a service by id', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new FindByIdServiceCatalogUseCase(repo as any);

    const dto = await useCase.execute('svc-1');

    expect(dto.name).toBe('Troca de óleo');
  });

  it('throws when finding a missing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new FindByIdServiceCatalogUseCase(repo as any);

    await expect(useCase.execute('missing')).rejects.toThrow(
      ServiceNotFoundException,
    );
  });
});
