import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
import ListVehiclesUseCase from '@customer-management/application/usecases/list-vehicle.usecase';
import UpdateVehicleUseCase from '@customer-management/application/usecases/update-vehicle.usecase';
import ArchiveVehicleUseCase from '@customer-management/application/usecases/archive-vehicle.usecase';
import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import VehicleNotFoundException from '@customer-management/domain/exceptions/vehicle-not-found.exception';

const buildVehicle = () =>
  VehicleFactory.create({
    id: 'vehicle-1',
    licensePlate: 'ABC1D23',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    customerId: 'customer-1',
  });

const buildCustomer = () =>
  CustomerFactory.create({
    id: 'customer-1',
    documentType: 'CPF',
    documentNumber: '52998224725',
    name: 'John Doe',
  });

const buildVehicleRepo = () => ({
  findById: jest.fn(),
  getById: jest.fn(),
  findByLicensePlate: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
  archiveAllByCustomerId: jest.fn(),
});

const buildCustomerRepo = () => ({
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

const input = {
  licensePlate: 'ABC1D23',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  customerId: 'customer-1',
};

describe('CreateVehicleUseCase', () => {
  it('creates a vehicle for an existing customer after checking uniqueness', async () => {
    const vehicleRepo = buildVehicleRepo();
    const customerRepo = buildCustomerRepo();
    const checker = { checkUniqueness: jest.fn() };
    customerRepo.getById.mockResolvedValue(buildCustomer());
    const useCase = new CreateVehicleUseCase(
      vehicleRepo,
      customerRepo,
      checker as any,
    );

    const output = await useCase.execute(input);
    expect(customerRepo.getById).toHaveBeenCalledWith('customer-1');
    expect(checker.checkUniqueness).toHaveBeenCalledTimes(1);
    expect(vehicleRepo.create).toHaveBeenCalledTimes(1);
    expect(output.vehicle.licensePlate).toBe('ABC1D23');
  });

  it('propagates when the customer does not exist', async () => {
    const vehicleRepo = buildVehicleRepo();
    const customerRepo = buildCustomerRepo();
    const checker = { checkUniqueness: jest.fn() };
    customerRepo.getById.mockRejectedValue(new Error('Customer Not Found.'));
    const useCase = new CreateVehicleUseCase(
      vehicleRepo,
      customerRepo,
      checker as any,
    );

    await expect(useCase.execute(input as any)).rejects.toThrow(
      'Customer Not Found.',
    );
    expect(vehicleRepo.create).not.toHaveBeenCalled();
  });
});

describe('FindVehicleByIdUseCase', () => {
  it('returns the vehicle DTO', async () => {
    const query = buildQueryService();
    query.getById.mockResolvedValue({ id: 'vehicle-1' });
    const useCase = new FindVehicleByIdUseCase(query);

    const output = await useCase.execute({ id: 'vehicle-1' });
    expect(output.vehicle.id).toBe('vehicle-1');
  });
});

describe('ListVehiclesUseCase', () => {
  it('lists vehicles, optionally by customer', async () => {
    const query = buildQueryService();
    query.findAll.mockResolvedValue([{ id: 'vehicle-1' }]);
    const useCase = new ListVehiclesUseCase(query);

    const result = await useCase.execute({ customerId: 'customer-1' });
    expect(query.findAll).toHaveBeenCalledWith({ customerId: 'customer-1' });
    expect(result.vehicles).toHaveLength(1);
  });
});

describe('UpdateVehicleUseCase', () => {
  it('updates an existing vehicle', async () => {
    const repo = buildVehicleRepo();
    repo.getById.mockResolvedValue(buildVehicle());
    const checker = { checkUniqueness: jest.fn() };
    const useCase = new UpdateVehicleUseCase(repo, checker as any);

    const dto = await useCase.execute({
      id: 'vehicle-1',
      brand: 'Honda',
      year: 2022,
      licensePlate: 'ABC1D23',
    });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(dto.vehicle.brand).toBe('Honda');
    expect(dto.vehicle.year).toBe(2022);
  });

  it('throws when vehicle not found', async () => {
    const repo = buildVehicleRepo();
    repo.getById.mockRejectedValue(new VehicleNotFoundException());
    const checker = { checkUniqueness: jest.fn() };
    const useCase = new UpdateVehicleUseCase(repo, checker as any);

    await expect(
      useCase.execute({ id: 'missing', brand: 'X' } as any),
    ).rejects.toThrow(VehicleNotFoundException);
  });
});

describe('ArchiveVehicleUseCase', () => {
  it('archives an existing vehicle', async () => {
    const repo = buildVehicleRepo();
    repo.getById.mockResolvedValue(buildVehicle());
    const useCase = new ArchiveVehicleUseCase(repo);

    await useCase.execute({ id: 'vehicle-1' });
    expect(repo.archive).toHaveBeenCalledTimes(1);
  });
});
