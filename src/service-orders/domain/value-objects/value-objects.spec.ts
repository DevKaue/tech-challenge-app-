import { MechanicAssignment } from './mechanic-assignment.value-object';
import { UserRole } from '@service-orders/domain/enums/user-role.enum';
import { Money } from './money.value-object';
import { StatusChange } from './status-change.value-object';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

describe('MechanicAssignment', () => {
  it('should create with valid mechanic', () => {
    const ma = MechanicAssignment.create('mech-1', 'João', UserRole.MECHANIC);
    expect(ma.id).toBe('mech-1');
    expect(ma.name).toBe('João');
  });

  it('should throw when id is empty', () => {
    expect(() =>
      MechanicAssignment.create('', 'João', UserRole.MECHANIC),
    ).toThrow('Mechanic id is required');
  });

  it('should throw when role is not MECHANIC', () => {
    expect(() =>
      MechanicAssignment.create('mech-1', 'Maria', UserRole.ATTENDANT),
    ).toThrow('User is not a mechanic');
  });

  it('should throw when role is empty', () => {
    expect(() =>
      MechanicAssignment.create('mech-1', 'Test', '' as UserRole),
    ).toThrow('User is not a mechanic');
  });

  it('should identify same mechanic via isSame', () => {
    const ma = MechanicAssignment.create('mech-1', 'João', UserRole.MECHANIC);
    expect(ma.isSame('mech-1')).toBe(true);
    expect(ma.isSame('other')).toBe(false);
  });
});

describe('Money', () => {
  describe('fromFloat', () => {
    it('should create from float value', () => {
      const m = Money.fromFloat(150.5);
      expect(m.cents).toBe(15050);
      expect(m.float).toBe(150.5);
    });

    it('should create from zero', () => {
      const m = Money.fromFloat(0);
      expect(m.cents).toBe(0);
      expect(m.float).toBe(0);
    });

    it('should round to nearest cent', () => {
      const m = Money.fromFloat(10.999);
      expect(m.cents).toBe(1100);
    });

    it('should throw when value is negative', () => {
      expect(() => Money.fromFloat(-10)).toThrow(
        'Money value cannot be negative',
      );
    });
  });

  describe('fromCents', () => {
    it('should create from cents', () => {
      const m = Money.fromCents(15000);
      expect(m.cents).toBe(15000);
      expect(m.float).toBe(150);
    });

    it('should throw when cents is negative', () => {
      expect(() => Money.fromCents(-1)).toThrow(
        'Money value cannot be negative',
      );
    });
  });

  describe('multiply', () => {
    it('should multiply by quantity', () => {
      const m = Money.fromFloat(45.5);
      const result = m.multiply(3);
      expect(result.cents).toBe(13650);
      expect(result.float).toBeCloseTo(136.5);
    });
  });

  describe('add', () => {
    it('should sum two Money values', () => {
      const a = Money.fromFloat(100);
      const b = Money.fromFloat(50.5);
      const result = a.add(b);
      expect(result.float).toBeCloseTo(150.5);
    });
  });
});

describe('StatusChange', () => {
  it('should expose previous and new status', () => {
    const sc = new StatusChange(
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSIS,
    );
    expect(sc.previousStatus).toBe(ServiceOrderStatus.RECEIVED);
    expect(sc.newStatus).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
  });
});
