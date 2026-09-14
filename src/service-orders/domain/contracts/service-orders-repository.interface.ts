import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';
import { PersistedEstimate } from '@service-orders/domain/persistence/estimate.persistence';
import { PersistedServiceOrder } from '@service-orders/domain/persistence/service-order.persistence';
import { PersistedEstimateItem } from '@service-orders/domain/persistence/estimate-item.persistence';
import { PersistedStatusHistory } from '@service-orders/domain/persistence/status-history.persistence';
import { ServiceOrder } from '../entities/service-order.entity';

export type {
  PersistedServiceOrder,
  PersistedEstimate,
  PersistedEstimateItem,
  PersistedStatusHistory,
};

export type EstimateWithItems = PersistedEstimate & {
  items: PersistedEstimateItem[];
};

export type ServiceOrderWithRelations = PersistedServiceOrder & {
  customer: {
    id: string;
    document: string;
    name: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  mechanic: {
    id: string;
    name: string;
    role: string;
  } | null;
  estimates: EstimateWithItems[];
  statusHistory: PersistedStatusHistory[];
};

export type ServiceOrderUpdateData = {
  status?: ServiceOrderStatus;
  mechanicId?: string | null;
  closedAt?: Date | null;
};

export abstract class ServiceOrdersRepositoryInterface {
  abstract create(data: {
    customerId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
    mileage?: number | null;
    notes?: string | null;
  }): Promise<PersistedServiceOrder>;

  abstract findAll(): Promise<PersistedServiceOrder[]>;

  abstract findById(id: string): Promise<ServiceOrderWithRelations | null>;

  abstract findEstimateById(id: string): Promise<EstimateWithItems | null>;

  abstract update(
    id: string,
    //data: ServiceOrderUpdateData,
    order: ServiceOrder,
  ): Promise<PersistedServiceOrder>;

  abstract createStatusHistory(data: {
    serviceOrderId: string;
    previousStatus: ServiceOrderStatus | null;
    newStatus: ServiceOrderStatus;
    changedBy?: string;
    notes?: string;
  }): Promise<PersistedStatusHistory>;

  abstract createEstimate(data: {
    serviceOrderId: string;
    status: EstimateStatus;
    totalAmount: number;
  }): Promise<PersistedEstimate>;

  abstract addEstimateItem(data: {
    estimateId: string;
    itemType: ServiceOrderItemType;
    referenceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }): Promise<PersistedEstimateItem>;

  abstract updateEstimateStatus(
    id: string,
    status: EstimateStatus,
    approvedAt?: Date,
  ): Promise<PersistedEstimate>;

  /**
   * Recalcula o totalAmount do orçamento somando o totalPrice de todos os
   * seus itens e persiste o valor agregado.
   */
  abstract recalcEstimateTotal(estimateId: string): Promise<PersistedEstimate>;

  abstract findExecutionTimes(): Promise<
    Array<{ startTime: Date; endTime: Date }>
  >;
}
