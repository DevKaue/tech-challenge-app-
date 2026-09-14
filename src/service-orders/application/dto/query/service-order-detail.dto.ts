import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';

class EstimateItemDto {
  id: string;
  itemType: string;
  referenceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

class EstimateDto {
  id: string;
  status: EstimateStatus;
  totalAmount: number;
  validUntil: Date | null;
  approvedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: EstimateItemDto[];
}

class StatusHistoryDto {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string | null;
  notes: string | null;
  changedAt: Date;
}

export class ServiceOrderDetailDto {
  id: string;
  status: string;
  mileage: number | null;
  notes: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  customer: {
    id: string;
    document: string;
    email: string | null;
    phone: string | null;
    name: string;
  };

  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    customerId: string;
  };

  mechanic: {
    id: string;
    name: string;
    role: string;
  } | null;

  estimates: EstimateDto[];
  statusHistory: StatusHistoryDto[];
}
