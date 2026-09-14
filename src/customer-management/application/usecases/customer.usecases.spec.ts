import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import FindCustomerByIdUseCase from '@customer-management/application/usecases/find-customer-by-id.usecase';
import ListCustomersUseCase from '@customer-management/application/usecases/list-customer.usecase';
import UpdateCustomerUseCase from '@customer-management/application/usecases/update-customer.usecase';
import ArchiveCustomerUseCase from '@customer-management/application/usecases/archive-customer.usecase';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import CustomerNotFoundException from '@customer-management/domain/exceptions/customer-not-found.exception';

const buildCustomer = () =>
  CustomerFactory.create({
    id: 'customer-1',
    documentType: 'CPF',
    documentNumber: '52998224725',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '11999999999',
  });

const buildRepository = () => ({
  findById: jest.fn(),
  getById: jest.fn(),
  findByDocument: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
});

const buildQueryService = () => ({
  getById: jest.fn(),
  findAll: jest.fn(),
});

describe('CreateCustomerUseCase', () => {
  it('creates a new customer after checking uniqueness', async () => {
    const repo = buildRepository();
    const checker = { checkUniqueness: jest.fn() };
    const useCase = new CreateCustomerUseCase(repo, checker as any);

    const output = await useCase.execute({
      documentType: 'CPF',
      documentNumber: '52998224725',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '11999999999',
    });

    expect(checker.checkUniqueness).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(output.customer.name).toBe('John Doe');
  });

  it('does not create when uniqueness check fails', async () => {
    const repo = buildRepository();
    const checker = {
      checkUniqueness: jest.fn().mockRejectedValue(new Error('duplicated')),
    };
    const useCase = new CreateCustomerUseCase(repo, checker as any);

    await expect(
      useCase.execute({
        documentType: 'CPF',
        documentNumber: '52998224725',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      }),
    ).rejects.toThrow('duplicated');
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('FindCustomerByIdUseCase', () => {
  it('returns a customer DTO', async () => {
    const query = buildQueryService();
    query.getById.mockResolvedValue({ id: 'customer-1', name: 'John' });
    const useCase = new FindCustomerByIdUseCase(query);

    const output = await useCase.execute({ id: 'customer-1' });
    expect(output.customer.id).toBe('customer-1');
    expect(query.getById).toHaveBeenCalledWith({ id: 'customer-1' });
  });
});

describe('ListCustomersUseCase', () => {
  it('lists all customers', async () => {
    const query = buildQueryService();
    query.findAll.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    const useCase = new ListCustomersUseCase(query);

    const result = await useCase.execute();
    expect(result.customers).toHaveLength(2);
  });
});

describe('UpdateCustomerUseCase', () => {
  it('updates an existing customer', async () => {
    const repo = buildRepository();
    repo.getById.mockResolvedValue(buildCustomer());
    const useCase = new UpdateCustomerUseCase(repo);

    const dto = await useCase.execute({
      id: 'customer-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(dto.customer.name).toBe('Jane Doe');
    expect(dto.customer.email).toBe('jane@example.com');
  });

  it('throws when customer not found', async () => {
    const repo = buildRepository();
    repo.getById.mockRejectedValue(new CustomerNotFoundException());
    const useCase = new UpdateCustomerUseCase(repo);

    await expect(
      useCase.execute({ id: 'missing', name: 'X' } as any),
    ).rejects.toThrow(CustomerNotFoundException);
  });
});

describe('ArchiveCustomerUseCase', () => {
  it('archives the customer and its vehicles in a transaction', async () => {
    const repo = buildRepository();
    repo.getById.mockResolvedValue(buildCustomer());
    const vehicleRepo = { archiveAllByCustomerId: jest.fn() };
    const unitOfWork = {
      runInTransaction: jest.fn(async (cb: () => Promise<void>) => cb()),
    };
    const useCase = new ArchiveCustomerUseCase(
      repo,
      vehicleRepo as any,
      unitOfWork as any,
    );

    await useCase.execute({ id: 'customer-1' });

    expect(unitOfWork.runInTransaction).toHaveBeenCalledTimes(1);
    expect(vehicleRepo.archiveAllByCustomerId).toHaveBeenCalledWith(
      'customer-1',
    );
    expect(repo.archive).toHaveBeenCalledTimes(1);
  });
});
