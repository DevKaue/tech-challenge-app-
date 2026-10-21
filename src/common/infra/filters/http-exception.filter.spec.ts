import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { allExceptionStatusMaps } from '@/exception-status.registry';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import { InvalidCredentialsException } from '@/access-identity/domain/exceptions/invalid-credentials.exception';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { method: string; url: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter(allExceptionStatusMaps);

    jest.spyOn(filter['logger'], 'warn').mockImplementation(() => {});
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => {});

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = { method: 'POST', url: '/api/test' };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles HttpException with object response', () => {
    filter.catch(
      new HttpException({ message: 'Bad data' }, HttpStatus.BAD_REQUEST),
      mockHost,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Bad Request', message: 'Bad data' }),
    );
  });

  it('handles HttpException with string response', () => {
    filter.catch(
      new HttpException('Not found', HttpStatus.NOT_FOUND),
      mockHost,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Not Found', message: 'Not found' }),
    );
  });

  it('resolves domain exceptions through the aggregated context maps', () => {
    filter.catch(new CustomerNotFoundException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Not Found',
        error_code: 'customer_not_found',
      }),
    );
  });

  it('resolves exceptions from a different bounded context with the same instance', () => {
    filter.catch(new InvalidCredentialsException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid Credentials' }),
    );
  });

  it('handles unknown error as 500', () => {
    filter.catch(new Error('Something went wrong'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      }),
    );
  });

  it('handles non-Error exception as 500', () => {
    filter.catch('string error', mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
