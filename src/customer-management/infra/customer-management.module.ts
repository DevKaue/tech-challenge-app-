import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/infra/prisma/prisma.module';
import { CustomerInfraController } from '@/customer-management/infra/controllers/customer.controller';
import { VehicleInfraController } from '@/customer-management/infra/controllers/vehicle.controller';
import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
import ArchiveVehicleUseCase from '@/customer-management/application/usecases/archive-vehicle.usecase';
import ArchiveCustomerUseCase from '@/customer-management/application/usecases/archive-customer.usecase';
import CustomerManagementFacade from '@customer-management/infra/integrations/customer-management.facade';
import CustomerManagementInterface from '@/common/application/contracts/customer-management.interface';

import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import PrismaCustomerRepository from '@customer-management/infra/repositories/prisma-customer.repository';
import PrismaVehicleRepository from '@customer-management/infra/repositories/prisma-vehicle.repository';
import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import FindCustomerByIdUseCase from '@customer-management/application/usecases/find-customer-by-id.usecase';
import ListCustomerUseCase from '@/customer-management/application/usecases/list-customer.usecase';
import UpdateCustomerUseCase from '@customer-management/application/usecases/update-customer.usecase';
import ListVehicleUseCase from '@/customer-management/application/usecases/list-vehicle.usecase';
import UpdateVehicleUseCase from '@customer-management/application/usecases/update-vehicle.usecase';
import PrismaCustomerQueryService from '@customer-management/infra/services/prisma-customer-query.service';
import PrismaVehicleQueryService from '@customer-management/infra/services/prisma-vehicle-query.service';

import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';
import PrismaUnitOfWorkService from '@customer-management/infra/services/prisma-unit-of-work.service';
import CustomerRegistrationChecker from '../domain/services/customer-registration-checker.service';
import VehicleRegistrationChecker from '../domain/services/vehicle-registration-checker.service';
import CreateCustomerController from '@/customer-management/presentation/controllers/create-customer.controller';
import FindCustomerByIdController from '@/customer-management/presentation/controllers/find-customer-by-id.controller';
import ListCustomersController from '@/customer-management/presentation/controllers/list-customers.controller';
import UpdateCustomerController from '@/customer-management/presentation/controllers/update-customer.controller';
import ArchiveCustomerController from '@/customer-management/presentation/controllers/archive-customer.controller';
import CreateVehicleController from '@/customer-management/presentation/controllers/create-vehicle.controller';
import FindVehicleByIdController from '@/customer-management/presentation/controllers/find-vehicle-by-id.controller';
import ListVehiclesController from '@/customer-management/presentation/controllers/list-vehicles.controller';
import UpdateVehicleController from '@/customer-management/presentation/controllers/update-vehicle.controller';
import ArchiveVehicleController from '@/customer-management/presentation/controllers/archive-vehicle.controller';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { EXCEPTION_STATUS_MAP } from '@/common/infra/filters/exception-status.map';
import { customerManagementStatusMap } from '@/customer-management/infra/filters/customer-management-status.map';
import { createProvider } from '@/common/infra/di/create-provider';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerInfraController, VehicleInfraController],
  providers: [
    { provide: EXCEPTION_STATUS_MAP, useValue: customerManagementStatusMap },
    DomainExceptionFilter,
    PrismaUnitOfWorkService,
    {
      provide: UnitOfWorkServiceInterface,
      useClass: PrismaUnitOfWorkService,
    },
    {
      provide: CustomerRepositoryInterface,
      useClass: PrismaCustomerRepository,
    },

    createProvider(CreateCustomerUseCase, [
      CustomerRepositoryInterface,
      CustomerRegistrationChecker,
    ]),

    createProvider(ArchiveCustomerUseCase, [
      CustomerRepositoryInterface,
      VehicleRepositoryInterface,
      UnitOfWorkServiceInterface,
    ]),

    {
      provide: VehicleRepositoryInterface,
      useClass: PrismaVehicleRepository,
    },

    createProvider(CreateVehicleUseCase, [
      VehicleRepositoryInterface,
      CustomerRepositoryInterface,
      VehicleRegistrationChecker,
    ]),

    createProvider(ArchiveVehicleUseCase, [VehicleRepositoryInterface]),

    {
      provide: CustomerQueryServiceInterface,
      useClass: PrismaCustomerQueryService,
    },

    createProvider(FindCustomerByIdUseCase, [CustomerQueryServiceInterface]),

    createProvider(ListCustomerUseCase, [CustomerQueryServiceInterface]),

    createProvider(UpdateCustomerUseCase, [CustomerRepositoryInterface]),

    {
      provide: VehicleQueryServiceInterface,
      useClass: PrismaVehicleQueryService,
    },

    createProvider(FindVehicleByIdUseCase, [VehicleQueryServiceInterface]),

    createProvider(ListVehicleUseCase, [VehicleQueryServiceInterface]),

    createProvider(UpdateVehicleUseCase, [
      VehicleRepositoryInterface,
      VehicleRegistrationChecker,
    ]),

    createProvider(VehicleRegistrationChecker, [VehicleRepositoryInterface]),

    createProvider(CustomerRegistrationChecker, [CustomerRepositoryInterface]),

    {
      provide: CustomerManagementInterface,
      useFactory: (
        findCustomerByIdUseCase: FindCustomerByIdUseCase,
        findVehicleByIdUseCase: FindVehicleByIdUseCase,
      ) => {
        return new CustomerManagementFacade(
          findCustomerByIdUseCase,
          findVehicleByIdUseCase,
        );
      },
      inject: [FindCustomerByIdUseCase, FindVehicleByIdUseCase],
    },

    createProvider(CreateCustomerController, [CreateCustomerUseCase]),
    createProvider(FindCustomerByIdController, [FindCustomerByIdUseCase]),
    createProvider(ListCustomersController, [ListCustomerUseCase]),
    createProvider(UpdateCustomerController, [UpdateCustomerUseCase]),
    createProvider(ArchiveCustomerController, [ArchiveCustomerUseCase]),

    createProvider(CreateVehicleController, [CreateVehicleUseCase]),
    createProvider(FindVehicleByIdController, [FindVehicleByIdUseCase]),
    createProvider(ListVehiclesController, [ListVehicleUseCase]),
    createProvider(UpdateVehicleController, [UpdateVehicleUseCase]),
    createProvider(ArchiveVehicleController, [ArchiveVehicleUseCase]),
  ],
  exports: [CustomerManagementInterface],
})
export class CustomerManagementModule {}
