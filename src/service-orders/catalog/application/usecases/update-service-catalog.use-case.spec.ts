import Service from '@service-orders/catalog/domain/entities/service.entity';
import { UpdateServiceCatalogUseCase } from './update-service-catalog.use-case';
import ServiceNotFoundException from '../exceptions/service-not-found.exception';

const buildService = () =>
  new Service({ id: 'svc-1', name: 'Troca de óleo', price: 150 });

describe('UpdateServiceCatalogUseCase', () => {
  const buildRepo = () => ({
    findById: jest.fn(),
    update: jest.fn(),
  });

  it('updates an existing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new UpdateServiceCatalogUseCase(repo as any);

    const dto = await useCase.execute('svc-1', { price: 200 });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(dto.price).toBe(200);
  });

  it('throws when updating a missing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateServiceCatalogUseCase(repo as any);

    await expect(useCase.execute('missing', { price: 1 })).rejects.toThrow(
      ServiceNotFoundException,
    );
  });
});
