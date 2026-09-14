import Service from '@service-orders/catalog/domain/entities/service.entity';
import { ListServiceCatalogUseCase } from './list-service-catalog.use-case';

const buildService = () =>
  new Service({ id: 'svc-1', name: 'Troca de óleo', price: 150 });

describe('ListServicesUseCase', () => {
  const buildRepo = () => ({
    findAll: jest.fn(),
  });

  it('lists services', async () => {
    const repo = buildRepo();
    repo.findAll.mockResolvedValue([buildService()]);
    const useCase = new ListServiceCatalogUseCase(repo as any);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('svc-1');
  });
});
