import { ServiceOrder } from './service-order.entity';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';
import { UserRole } from '@service-orders/domain/enums/user-role.enum';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

describe('ServiceOrder', () => {
  const defaultProps = {
    id: 'order-1',
    status: ServiceOrderStatus.RECEIVED,
  };

  const validMechanic = MechanicAssignment.create(
    'mech-1',
    'Joao',
    UserRole.MECHANIC,
  );

  describe('create', () => {
    it('should create an entity with given props', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(order.id).toBe('order-1');
      expect(order.status).toBe(ServiceOrderStatus.RECEIVED);
      expect(order.mechanicId).toBeNull();
    });

    it('should create entity with mechanic when provided', () => {
      const mechanic = MechanicAssignment.fromPersistence('mech-1', 'Joao');
      const props = { ...defaultProps, mechanic };
      const order = ServiceOrder.create(props);
      expect(order.mechanicId).toBe('mech-1');
      expect(order.mechanicName).toBe('Joao');
    });
  });

  describe('assignMechanic', () => {
    it('should assign a mechanic when status is RECEIVED', () => {
      const order = ServiceOrder.create(defaultProps);
      order.assignMechanic(validMechanic);
      expect(order.mechanicId).toBe('mech-1');
    });

    it('should throw when status is not RECEIVED', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      const order = ServiceOrder.create(props);
      expect(() => order.assignMechanic(validMechanic)).toThrow(
        'Cannot assign mechanic when status is IN_EXECUTION',
      );
    });

    it('should throw when user is not a mechanic', () => {
      expect(() =>
        MechanicAssignment.create('user-2', 'Maria', UserRole.ATTENDANT),
      ).toThrow('User is not a mechanic');
    });
  });

  describe('open', () => {
    it('should create a new entity in RECEIVED', () => {
      const order = ServiceOrder.open({ id: 'order-1' });
      expect(order.id).toBe('order-1');
      expect(order.status).toBe(ServiceOrderStatus.RECEIVED);
      expect(order.mechanicId).toBeNull();
    });
  });

  describe('requestApproval', () => {
    it('should transition from IN_DIAGNOSIS to WAITING_APPROVAL', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      const order = ServiceOrder.create(props);
      const change = order.requestApproval();
      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.IN_DIAGNOSIS,
        newStatus: ServiceOrderStatus.WAITING_APPROVAL,
      });
      expect(order.status).toBe(ServiceOrderStatus.WAITING_APPROVAL);
    });

    it('should throw when status is RECEIVED', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(() => order.requestApproval()).toThrow(
        'Cannot request approval when status is RECEIVED. Expected: IN_DIAGNOSIS',
      );
    });

    it('should throw when status is IN_EXECUTION', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      const order = ServiceOrder.create(props);
      expect(() => order.requestApproval()).toThrow(
        'Cannot request approval when status is IN_EXECUTION',
      );
    });
  });

  describe('rejectEstimate', () => {
    it('should transition from WAITING_APPROVAL back to IN_DIAGNOSIS', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      };
      const order = ServiceOrder.create(props);
      const change = order.rejectEstimate();
      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.WAITING_APPROVAL,
        newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      });
      expect(order.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('should throw when status is not WAITING_APPROVAL', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(() => order.rejectEstimate()).toThrow(
        'Cannot reject estimate when status is RECEIVED',
      );
    });
  });

  describe('startDiagnosis', () => {
    it('should transition from RECEIVED to IN_DIAGNOSIS', () => {
      const order = ServiceOrder.create(defaultProps);
      const change = order.startDiagnosis();
      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.RECEIVED,
        newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      });
      expect(order.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('should throw when status is not RECEIVED or IN_DIAGNOSIS', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      };
      const order = ServiceOrder.create(props);
      expect(() => order.startDiagnosis()).toThrow(
        'Cannot start diagnosis when status is WAITING_APPROVAL',
      );
    });
  });

  describe('startService', () => {
    it('should transition from WAITING_APPROVAL to IN_EXECUTION', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      };
      const order = ServiceOrder.create(props);

      const change = order.startService();

      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.WAITING_APPROVAL,
        newStatus: ServiceOrderStatus.IN_EXECUTION,
      });
      expect(order.status).toBe(ServiceOrderStatus.IN_EXECUTION);
    });

    it('should throw when status is not WAITING_APPROVAL', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(() => order.startService()).toThrow(
        'Cannot start service when status is RECEIVED',
      );
    });
  });

  describe('finish', () => {
    it('should transition from IN_EXECUTION to FINISHED', () => {
      const mechanic = MechanicAssignment.fromPersistence('mech-1', 'Joao');
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.IN_EXECUTION,
        mechanic,
      };
      const order = ServiceOrder.create(props);

      const change = order.finish('mech-1');

      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.IN_EXECUTION,
        newStatus: ServiceOrderStatus.FINISHED,
      });
      expect(order.status).toBe(ServiceOrderStatus.FINISHED);
    });

    it('should throw when status is not IN_EXECUTION', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(() => order.finish('mech-1')).toThrow(
        'Cannot finish when status is RECEIVED',
      );
    });

    it('should throw when not the assigned mechanic', () => {
      const mechanic = MechanicAssignment.fromPersistence('mech-A', 'Maria');
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.IN_EXECUTION,
        mechanic,
      };
      const order = ServiceOrder.create(props);
      expect(() => order.finish('mech-B')).toThrow(
        'Only the assigned mechanic can finish this service order',
      );
    });

    it('should throw when no mechanic assigned', () => {
      const props = {
        ...defaultProps,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      const order = ServiceOrder.create(props);
      expect(() => order.finish('mech-1')).toThrow(
        'Only the assigned mechanic can finish this service order',
      );
    });
  });

  describe('deliverVehicle', () => {
    it('should transition from FINISHED to DELIVERED', () => {
      const props = { ...defaultProps, status: ServiceOrderStatus.FINISHED };
      const order = ServiceOrder.create(props);

      const change = order.deliverVehicle();

      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.FINISHED,
        newStatus: ServiceOrderStatus.DELIVERED,
      });
      expect(order.status).toBe(ServiceOrderStatus.DELIVERED);
    });

    it('should throw when status is not FINISHED', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(() => order.deliverVehicle()).toThrow(
        'Cannot deliver vehicle when status is RECEIVED',
      );
    });
  });

  describe('close', () => {
    it('should transition from DELIVERED to CLOSED', () => {
      const props = { ...defaultProps, status: ServiceOrderStatus.DELIVERED };
      const order = ServiceOrder.create(props);

      const change = order.close();

      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.DELIVERED,
        newStatus: ServiceOrderStatus.CLOSED,
      });
      expect(order.status).toBe(ServiceOrderStatus.CLOSED);
    });

    it('should throw when status is not DELIVERED', () => {
      const order = ServiceOrder.create(defaultProps);
      expect(() => order.close()).toThrow(
        'Cannot close when status is RECEIVED',
      );
    });
  });

  describe('updateStatus', () => {
    it('should use the domain transition for the requested status', () => {
      const order = ServiceOrder.create(defaultProps);

      const change = order.updateStatus(
        ServiceOrderStatus.IN_DIAGNOSIS,
        'attendant-1',
      );

      expect(change).toEqual({
        previousStatus: ServiceOrderStatus.RECEIVED,
        newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      });
    });

    it('should return to diagnosis when an estimate is rejected', () => {
      const order = ServiceOrder.create({
        ...defaultProps,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      });

      const change = order.updateStatus(
        ServiceOrderStatus.IN_DIAGNOSIS,
        'attendant-1',
      );

      expect(change.newStatus).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('should not allow the status to return to RECEIVED', () => {
      const order = ServiceOrder.create({
        ...defaultProps,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      });

      expect(() =>
        order.updateStatus(ServiceOrderStatus.RECEIVED, 'attendant-1'),
      ).toThrow('Cannot move a service order back to RECEIVED');
    });

    it('should not create a transition to the current status', () => {
      const order = ServiceOrder.create(defaultProps);

      expect(() =>
        order.updateStatus(ServiceOrderStatus.RECEIVED, 'attendant-1'),
      ).toThrow('Service order is already in status RECEIVED');
    });
  });
});
