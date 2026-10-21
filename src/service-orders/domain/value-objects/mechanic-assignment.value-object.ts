import { UserRole } from '@service-orders/domain/enums/user-role.enum';

export class MechanicAssignment {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
  ) {}

  static fromPersistence(id: string, name: string): MechanicAssignment {
    if (!id) {
      throw new Error('Mechanic id is required');
    }
    return new MechanicAssignment(id, name);
  }

  static create(id: string, name: string, role: UserRole): MechanicAssignment {
    if (!id) {
      throw new Error('Mechanic id is required');
    }
    if (role !== UserRole.MECHANIC) {
      throw new Error('User is not a mechanic');
    }
    return new MechanicAssignment(id, name);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  isSame(mechanicId: string): boolean {
    return this._id === mechanicId;
  }
}
