import { HttpStatus } from '@nestjs/common';
import { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import DomainException from '@/customer-management/domain/exceptions/domain.exception';
import CustomerAlreadyExistsException from '@/customer-management/domain/exceptions/customer-already-exists.exception';
import CustomerIsArchivedException from '@/customer-management/domain/exceptions/customer-is-archived.exception';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import VehicleAlreadyExistsException from '@/customer-management/domain/exceptions/vehicle-already-exists.exception';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';

export const customerManagementStatusMap: ExceptionStatusMap = [
  // Base do contexto: cobre também InvalidDocumentException e
  // InvalidLicensePlateException, que herdam dela. O resolver prefere sempre a
  // entrada mais específica, então listar a base aqui não afeta as demais.
  [DomainException, HttpStatus.BAD_REQUEST],
  [CustomerNotFoundException, HttpStatus.NOT_FOUND],
  [VehicleNotFoundException, HttpStatus.NOT_FOUND],
  [CustomerAlreadyExistsException, HttpStatus.CONFLICT],
  [CustomerIsArchivedException, HttpStatus.CONFLICT],
  [VehicleAlreadyExistsException, HttpStatus.CONFLICT],
];
