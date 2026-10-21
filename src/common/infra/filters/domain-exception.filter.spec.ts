import { ArgumentsHost } from '@nestjs/common';
import CustomerAlreadyExistsException from '@/customer-management/domain/exceptions/customer-already-exists.exception';
import CustomerIsArchivedException from '@/customer-management/domain/exceptions/customer-is-archived.exception';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import DomainException from '@/customer-management/domain/exceptions/domain.exception';
import InvalidDocumentException from '@/customer-management/domain/exceptions/invalid-document.exception';
import VehicleAlreadyExistsException from '@/customer-management/domain/exceptions/vehicle-already-exists.exception';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { customerManagementStatusMap } from '@/customer-management/infra/filters/customer-management-status.map';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter(customerManagementStatusMap);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as unknown as ArgumentsHost;
  });

  it('maps CustomerAlreadyExistsException to 409', () => {
    filter.catch(new CustomerAlreadyExistsException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Already Exists',
        error_code: 'customer_already_exists',
      }),
    );
  });

  it('maps CustomerNotFoundException to 404', () => {
    filter.catch(new CustomerNotFoundException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Not Found',
        error_code: 'customer_not_found',
      }),
    );
  });

  it('maps CustomerIsArchivedException to 409', () => {
    filter.catch(new CustomerIsArchivedException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Is Archived',
        error_code: 'customer_is_archived',
      }),
    );
  });

  it('maps VehicleAlreadyExistsException to 409', () => {
    filter.catch(new VehicleAlreadyExistsException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Vehicle Already Exists',
        error_code: 'vehicle_already_exists',
      }),
    );
  });

  it('maps VehicleNotFoundException to 404', () => {
    filter.catch(new VehicleNotFoundException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Vehicle Not Found',
        error_code: 'vehicle_not_found',
      }),
    );
  });

  it('maps DomainException to 400 with the status reason phrase as title', () => {
    filter.catch(new DomainException('Invalid'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Bad Request', message: 'Invalid' }),
    );
  });

  it('resolves a subclass through its base entry, keeping the specific title', () => {
    // InvalidDocumentException não está no mapa: herda de DomainException e por
    // isso resolve para 400, sem precisar de entrada própria.
    filter.catch(new InvalidDocumentException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid Document',
        error_code: 'invalid_document',
      }),
    );
  });

  it('falls back to 500 for an exception outside the map', () => {
    filter.catch(new Error('boom'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        message: 'boom',
      }),
    );
  });
});
