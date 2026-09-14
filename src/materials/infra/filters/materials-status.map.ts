import { HttpStatus } from '@nestjs/common';
import { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import DomainException from '@/materials/domain/exceptions/domain.exception';
import InsufficientMaterialStockException from '@/materials/domain/exceptions/insufficient-material-stock.exception';
import MaterialNotFoundException from '@/materials/application/exceptions/material-not-found.exception';

export const materialsStatusMap: ExceptionStatusMap = [
  [DomainException, HttpStatus.BAD_REQUEST],
  [MaterialNotFoundException, HttpStatus.NOT_FOUND],
  [InsufficientMaterialStockException, HttpStatus.CONFLICT],
];
