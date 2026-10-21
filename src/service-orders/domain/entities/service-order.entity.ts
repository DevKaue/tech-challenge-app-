import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';
import { StatusChange } from '@service-orders/domain/value-objects/status-change.value-object';
import { ServiceOrderUpdateData } from '../contracts/service-orders-repository.interface';

type CreateServiceOrderProps = {
  id: string;
  status: ServiceOrderStatus;
  mechanic?: MechanicAssignment | null;
};

export class ServiceOrder {
  private _status: ServiceOrderStatus;
  private _mechanic: MechanicAssignment | null;
  private _closedAt: Date | null | undefined;

  private constructor(
    private readonly _id: string,
    status: ServiceOrderStatus,
    mechanic: MechanicAssignment | null,
  ) {
    this._status = status;
    this._mechanic = mechanic;
  }

  toUpdateData(): ServiceOrderUpdateData {
    return {
      status: this.status,
      mechanicId: this.mechanicId,
      closedAt: this._closedAt,
    };
  }

  static create(props: CreateServiceOrderProps): ServiceOrder {
    return new ServiceOrder(props.id, props.status, props.mechanic ?? null);
  }

  static open(props: { id: string }): ServiceOrder {
    return new ServiceOrder(props.id, ServiceOrderStatus.RECEIVED, null);
  }

  assignMechanic(mechanic: MechanicAssignment): void {
    if (this._status !== ServiceOrderStatus.RECEIVED) {
      throw new Error(
        `Cannot assign mechanic when status is ${this._status}. Expected: ${ServiceOrderStatus.RECEIVED}`,
      );
    }
    this._mechanic = mechanic;
  }

  startDiagnosis(): StatusChange {
    if (
      this._status !== ServiceOrderStatus.RECEIVED &&
      this._status !== ServiceOrderStatus.IN_DIAGNOSIS
    ) {
      throw new Error(
        `Cannot start diagnosis when status is ${this._status}. Expected: ${ServiceOrderStatus.RECEIVED} or ${ServiceOrderStatus.IN_DIAGNOSIS}`,
      );
    }
    const previous = this._status;
    this._status = ServiceOrderStatus.IN_DIAGNOSIS;
    return new StatusChange(previous, this._status);
  }

  requestApproval(): StatusChange {
    if (this._status !== ServiceOrderStatus.IN_DIAGNOSIS) {
      throw new Error(
        `Cannot request approval when status is ${this._status}. Expected: ${ServiceOrderStatus.IN_DIAGNOSIS}`,
      );
    }
    const previous = this._status;
    this._status = ServiceOrderStatus.WAITING_APPROVAL;
    return new StatusChange(previous, this._status);
  }

  rejectEstimate(): StatusChange {
    if (this._status !== ServiceOrderStatus.WAITING_APPROVAL) {
      throw new Error(
        `Cannot reject estimate when status is ${this._status}. Expected: ${ServiceOrderStatus.WAITING_APPROVAL}`,
      );
    }
    const previous = this._status;
    // Rejeição volta a OS para diagnóstico, permitindo novo orçamento.
    // (DELIVERED é um estado terminal de entrega do veículo, não de rejeição.)
    this._status = ServiceOrderStatus.IN_DIAGNOSIS;
    return new StatusChange(previous, this._status);
  }

  startService(): StatusChange {
    if (this._status !== ServiceOrderStatus.WAITING_APPROVAL) {
      throw new Error(
        `Cannot start service when status is ${this._status}. Expected: ${ServiceOrderStatus.WAITING_APPROVAL}`,
      );
    }
    const previous = this._status;
    this._status = ServiceOrderStatus.IN_EXECUTION;
    return new StatusChange(previous, this._status);
  }

  finish(mechanicId: string): StatusChange {
    if (this._status !== ServiceOrderStatus.IN_EXECUTION) {
      throw new Error(
        `Cannot finish when status is ${this._status}. Expected: ${ServiceOrderStatus.IN_EXECUTION}`,
      );
    }
    if (!this._mechanic || !this._mechanic.isSame(mechanicId)) {
      throw new Error(
        'Only the assigned mechanic can finish this service order',
      );
    }
    const previous = this._status;
    this._status = ServiceOrderStatus.FINISHED;
    return new StatusChange(previous, this._status);
  }

  deliverVehicle(): StatusChange {
    if (this._status !== ServiceOrderStatus.FINISHED) {
      throw new Error(
        `Cannot deliver vehicle when status is ${this._status}. Expected: ${ServiceOrderStatus.FINISHED}`,
      );
    }
    const previous = this._status;
    this._status = ServiceOrderStatus.DELIVERED;
    return new StatusChange(previous, this._status);
  }

  close(): StatusChange {
    if (this._status !== ServiceOrderStatus.DELIVERED) {
      throw new Error(
        `Cannot close when status is ${this._status}. Expected: ${ServiceOrderStatus.DELIVERED}`,
      );
    }
    const previous = this._status;
    this._status = ServiceOrderStatus.CLOSED;
    this._closedAt = new Date();
    return new StatusChange(previous, this._status);
  }

  updateStatus(status: ServiceOrderStatus, actorId: string): StatusChange {
    if (status === this._status) {
      throw new Error(`Service order is already in status ${status}`);
    }

    switch (status) {
      case ServiceOrderStatus.IN_DIAGNOSIS:
        return this._status === ServiceOrderStatus.WAITING_APPROVAL
          ? this.rejectEstimate()
          : this.startDiagnosis();
      case ServiceOrderStatus.WAITING_APPROVAL:
        return this.requestApproval();
      case ServiceOrderStatus.IN_EXECUTION:
        return this.startService();
      case ServiceOrderStatus.FINISHED:
        return this.finish(actorId);
      case ServiceOrderStatus.DELIVERED:
        return this.deliverVehicle();
      case ServiceOrderStatus.CLOSED:
        return this.close();
      case ServiceOrderStatus.RECEIVED:
        throw new Error('Cannot move a service order back to RECEIVED');
    }
  }

  get id(): string {
    return this._id;
  }

  get status(): ServiceOrderStatus {
    return this._status;
  }

  get mechanicId(): string | null {
    return this._mechanic?.id ?? null;
  }

  get mechanicName(): string | null {
    return this._mechanic?.name ?? null;
  }
}
