import { HttpStatus } from '@nestjs/common';
import { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { InsufficientStockException } from '@service-orders/application/exceptions/insufficient-stock.exception';
import { InvalidMaterialDataException } from '@service-orders/application/exceptions/invalid-material-data.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { PartNotFoundException } from '@service-orders/application/exceptions/part-not-found.exception';
import { ServiceCatalogNotFoundException } from '@service-orders/application/exceptions/service-catalog-not-found.exception';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';
import { UnauthorizedMechanicException } from '@service-orders/application/exceptions/unauthorized-mechanic.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';
import { DuplicateEstimateItemException } from '@service-orders/domain/exceptions/duplicate-estimate-item.exception';
import { UserNotMechanicException } from '@service-orders/domain/exceptions/user-not-mechanic.exception';
import { VehicleNotFoundException as DomainVehicleNotFoundException } from '@service-orders/domain/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException as DomainVehicleOwnerMismatchException } from '@service-orders/domain/exceptions/vehicle-owner-mismatch.exception';
import DomainException from '@service-orders/catalog/domain/exceptions/domain.exception';
import ServiceNotFoundException from '@service-orders/catalog/application/exceptions/service-not-found.exception';

export const serviceOrdersStatusMap: ExceptionStatusMap = [
  [ServiceOrderNotFoundException, HttpStatus.NOT_FOUND],
  [EstimateNotFoundException, HttpStatus.NOT_FOUND],
  [CustomerNotFoundException, HttpStatus.NOT_FOUND],
  [VehicleNotFoundException, HttpStatus.NOT_FOUND],
  [DomainVehicleNotFoundException, HttpStatus.NOT_FOUND],
  [PartNotFoundException, HttpStatus.NOT_FOUND],
  [ServiceCatalogNotFoundException, HttpStatus.NOT_FOUND],
  [UserNotMechanicException, HttpStatus.NOT_FOUND],
  [ServiceNotFoundException, HttpStatus.NOT_FOUND],
  [InsufficientStockException, HttpStatus.CONFLICT],
  [DuplicateEstimateItemException, HttpStatus.CONFLICT],
  [UnauthorizedMechanicException, HttpStatus.FORBIDDEN],
  [InvalidStatusTransitionException, HttpStatus.BAD_REQUEST],
  [InvalidMaterialDataException, HttpStatus.BAD_REQUEST],
  [DomainException, HttpStatus.BAD_REQUEST],
  [VehicleOwnerMismatchException, HttpStatus.BAD_REQUEST],
  [DomainVehicleOwnerMismatchException, HttpStatus.BAD_REQUEST],
];
