import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';
import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';

export interface ServiceOrderSummaryResponse {
  id: string;
  status: string;
  mileage: number | null;
  notes: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  customer: { id: string; name: string };
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
  };
  mechanic: { id: string; name: string } | null;
}

export interface ServiceOrderDetailResponse {
  id: string;
  status: string;
  mileage: number | null;
  notes: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  customer: {
    id: string;
    document: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    customer_id: string;
  };
  mechanic: { id: string; name: string; role: string } | null;
  estimates: Array<{
    id: string;
    status: string;
    total_amount: number;
    valid_until: Date | null;
    approved_at: Date | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    items: Array<{
      id: string;
      item_type: string;
      reference_id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      notes: string | null;
    }>;
  }>;
  status_history: Array<{
    id: string;
    previous_status: string | null;
    new_status: string;
    changed_by: string | null;
    notes: string | null;
    changed_at: Date;
  }>;
}

export class ServiceOrderPresenter {
  static presentSummary(
    dto: ServiceOrderSummaryDto,
  ): ServiceOrderSummaryResponse {
    return {
      id: dto.id,
      status: dto.status,
      mileage: dto.mileage,
      notes: dto.notes,
      closed_at: dto.closedAt,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
      customer: dto.customer,
      vehicle: dto.vehicle,
      mechanic: dto.mechanic,
    };
  }

  static presentMany(
    dtos: ServiceOrderSummaryDto[],
  ): ServiceOrderSummaryResponse[] {
    return dtos.map((dto) => ServiceOrderPresenter.presentSummary(dto));
  }

  static presentDetail(dto: ServiceOrderDetailDto): ServiceOrderDetailResponse {
    return {
      id: dto.id,
      status: dto.status,
      mileage: dto.mileage,
      notes: dto.notes,
      closed_at: dto.closedAt,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
      customer: dto.customer,
      vehicle: {
        ...dto.vehicle,
        customer_id: dto.vehicle.customerId,
      },
      mechanic: dto.mechanic,
      estimates: dto.estimates.map((est) => ({
        id: est.id,
        status: est.status,
        total_amount: est.totalAmount,
        valid_until: est.validUntil,
        approved_at: est.approvedAt,
        notes: est.notes,
        created_at: est.createdAt,
        updated_at: est.updatedAt,
        items: est.items.map((item) => ({
          id: item.id,
          item_type: item.itemType,
          reference_id: item.referenceId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          notes: item.notes,
        })),
      })),
      status_history: dto.statusHistory.map((h) => ({
        id: h.id,
        previous_status: h.previousStatus,
        new_status: h.newStatus,
        changed_by: h.changedBy,
        notes: h.notes,
        changed_at: h.changedAt,
      })),
    };
  }
}
