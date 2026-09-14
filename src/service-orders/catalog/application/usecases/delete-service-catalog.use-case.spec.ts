import Service from '@service-orders/catalog/domain/entities/service.entity';
import { DeleteServiceCatalogUseCase } from './delete-service-catalog.use-case';
import ServiceNotFoundException from '../exceptions/service-not-found.exception';

const buildService = () =>
  new Service({ id: 'svc-1', name: 'Troca de óleo', price: 150 });

describe('DeleteServiceCatalogUseCase', () => {
  const buildRepo = () => ({
    findById: jest.fn(),
    delete: jest.fn(),
  });

  it('deletes an existing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new DeleteServiceCatalogUseCase(repo as any);

    await useCase.execute('svc-1');

    expect(repo.delete).toHaveBeenCalledWith('svc-1');
  });

  it('throws when deleting a missing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteServiceCatalogUseCase(repo as any);

    await expect(useCase.execute('missing')).rejects.toThrow(
      ServiceNotFoundException,
    );
  });
});
