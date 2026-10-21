import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMechanicAvailabilityUseCase } from './update-mechanic-availability.use-case';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';

describe('UpdateMechanicAvailabilityUseCase', () => {
  let useCase: UpdateMechanicAvailabilityUseCase;
  let userRepository: { updateAvailability: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      updateAvailability: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateMechanicAvailabilityUseCase,
          useFactory: (userRepository: any) =>
            new UpdateMechanicAvailabilityUseCase(userRepository),
          inject: [USER_REPOSITORY],
        },
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get(UpdateMechanicAvailabilityUseCase);
  });

  it('should delegate to the user repository', async () => {
    await useCase.execute('user-1', false);

    expect(userRepository.updateAvailability).toHaveBeenCalledWith(
      'user-1',
      false,
    );
  });
});
