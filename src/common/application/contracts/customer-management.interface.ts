import CustomerDTO from '@/common/application/dtos/customer.dto';
import VehicleDTO from '@/common/application/dtos/vehicle.dto';

export default abstract class CustomerManagementInterface {
  abstract findCustomerById(prop: { id: string }): Promise<CustomerDTO | null>;
  abstract findVehicleById(prop: { id: string }): Promise<VehicleDTO | null>;
}
