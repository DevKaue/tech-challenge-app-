import CustomerManagementFacade from './customer-management.facade';
import CustomerNotFoundException from '@customer-management/domain/exceptions/customer-not-found.exception';
import VehicleNotFoundException from '@customer-management/domain/exceptions/vehicle-not-found.exception';

describe('CustomerManagementFacade', () => {
  let facade: CustomerManagementFacade;
  let findCustomerByIdUseCase: any;
  let findVehicleByIdUseCase: any;

  beforeEach(() => {
    findCustomerByIdUseCase = { execute: jest.fn() };
    findVehicleByIdUseCase = { execute: jest.fn() };
    facade = new CustomerManagementFacade(
      findCustomerByIdUseCase,
      findVehicleByIdUseCase,
    );
  });

  describe('findCustomerById', () => {
    it('returns CustomerDTO when found', async () => {
      findCustomerByIdUseCase.execute.mockResolvedValue({
        customer: {
          id: 'cust-1',
          name: 'John',
          document: { value: '52998224725' },
          email: { value: 'john@test.com' },
          phone: '11999999999',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await facade.findCustomerById({ id: 'cust-1' });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('cust-1');
    });

    it('returns null when CustomerNotFoundException is thrown', async () => {
      findCustomerByIdUseCase.execute.mockRejectedValue(
        new CustomerNotFoundException(),
      );
      const result = await facade.findCustomerById({ id: 'missing' });
      expect(result).toBeNull();
    });

    it('rethrows non-CustomerNotFoundException errors', async () => {
      findCustomerByIdUseCase.execute.mockRejectedValue(new Error('DB error'));
      await expect(facade.findCustomerById({ id: 'x' })).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('findVehicleById', () => {
    it('returns VehicleDTO when found', async () => {
      findVehicleByIdUseCase.execute.mockResolvedValue({
        vehicle: {
          id: 'veh-1',
          licensePlate: { value: 'ABC1234' },
          brand: 'Toyota',
          model: 'Corolla',
          year: { value: 2020 },
          customerId: 'cust-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await facade.findVehicleById({ id: 'veh-1' });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('veh-1');
    });

    it('returns null when VehicleNotFoundException is thrown', async () => {
      findVehicleByIdUseCase.execute.mockRejectedValue(
        new VehicleNotFoundException(),
      );
      const result = await facade.findVehicleById({ id: 'missing' });
      expect(result).toBeNull();
    });

    it('rethrows non-VehicleNotFoundException errors', async () => {
      findVehicleByIdUseCase.execute.mockRejectedValue(new Error('DB error'));
      await expect(facade.findVehicleById({ id: 'x' })).rejects.toThrow(
        'DB error',
      );
    });
  });
});
