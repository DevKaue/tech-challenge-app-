import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';
import Email from '@customer-management/domain/value-objects/email.vo';
import Year from '@customer-management/domain/value-objects/year.vo';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';

describe('Customer entity', () => {
  const build = () =>
    CustomerFactory.create({
      documentType: 'CPF',
      documentNumber: '52998224725',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '11999999999',
    });

  it('exposes getters', () => {
    const customer = build();
    expect(customer.id).toBeDefined();
    expect(customer.name).toBe('John Doe');
    expect(customer.email?.value).toBe('john@example.com');
    expect(customer.phone).toBe('11999999999');
    expect(customer.document.value).toBe('52998224725');
    expect(customer.createdAt).toBeInstanceOf(Date);
    expect(customer.updatedAt).toBeInstanceOf(Date);
    expect(customer.deletedAt).toBeUndefined();
  });

  it('updates only provided fields', () => {
    const customer = build();
    customer.changeName('Jane Doe');
    expect(customer.name).toBe('Jane Doe');
    expect(customer.phone).toBe('11999999999');
  });

  it('updates phone and email', () => {
    const customer = build();
    customer.changePhone('11888888888');
    customer.changeEmail(new Email('jane@x.com'));
    expect(customer.phone).toBe('11888888888');
    expect(customer.email?.value).toBe('jane@x.com');
  });

  it('soft deletes', () => {
    const customer = build();
    customer.softDelete();
    expect(customer.deletedAt).toBeInstanceOf(Date);
  });
});

describe('Vehicle entity', () => {
  const build = () =>
    VehicleFactory.create({
      licensePlate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      customerId: 'customer-1',
    });

  it('exposes getters', () => {
    const vehicle = build();
    expect(vehicle.id).toBeDefined();
    expect(vehicle.licensePlate.value).toBe('ABC1D23');
    expect(vehicle.brand).toBe('Toyota');
    expect(vehicle.model).toBe('Corolla');
    expect(vehicle.year.value).toBe(2020);
    expect(vehicle.customerId).toBe('customer-1');
    expect(vehicle.deletedAt).toBeUndefined();
  });

  it('updates provided fields', () => {
    const vehicle = build();
    vehicle.changeBrand('Honda');
    vehicle.changeModel('Civic');
    vehicle.changeYear(new Year(2022));
    vehicle.changeLicensePlate(new LicensePlate('XYZ4321'));
    expect(vehicle.brand).toBe('Honda');
    expect(vehicle.model).toBe('Civic');
    expect(vehicle.year.value).toBe(2022);
    expect(vehicle.licensePlate.value).toBe('XYZ4321');
  });

  it('soft deletes', () => {
    const vehicle = build();
    vehicle.softDelete();
    expect(vehicle.deletedAt).toBeInstanceOf(Date);
  });
});
