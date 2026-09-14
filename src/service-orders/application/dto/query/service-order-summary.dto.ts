export class ServiceOrderSummaryDto {
  id: string;
  status: string;
  mileage: number | null;
  notes: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  customer: {
    id: string;
    name: string;
  };

  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
  };

  mechanic: {
    id: string;
    name: string;
  } | null;
}
