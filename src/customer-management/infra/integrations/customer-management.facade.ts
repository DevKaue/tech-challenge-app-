import CustomerDTO from '@/common/application/dtos/customer.dto';
import VehicleDTO from '@/common/application/dtos/vehicle.dto';
import FindCustomerByIdUseCase from '@/customer-management/application/usecases/find-customer-by-id.usecase';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import FindVehicleByIdUseCase from '@/customer-management/application/usecases/find-vehicle-by-id.usecase';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';
import CustomerManagementInterface from '@/common/application/contracts/customer-management.interface';

export default class CustomerManagementFacade implements CustomerManagementInterface {
  constructor(
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
  ) {}

  async findCustomerById(prop: { id: string }): Promise<CustomerDTO | null> {
    try {
      const output = await this.findCustomerByIdUseCase.execute({
        id: prop.id,
      });
      const customerDTO = new CustomerDTO(output.customer);
      return customerDTO;
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async findVehicleById(prop: { id: string }): Promise<VehicleDTO | null> {
    try {
      const output = await this.findVehicleByIdUseCase.execute({
        id: prop.id,
      });
      const vehicleDTO = new VehicleDTO(output.vehicle);
      return vehicleDTO;
    } catch (error) {
      if (error instanceof VehicleNotFoundException) {
        return null;
      }
      throw error;
    }
  }
}
