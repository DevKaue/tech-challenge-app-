export interface PersistedServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  status: string;
  mileage: number | null;
  notes: string | null;
  mechanicId: string | null;
  mechanic: { id: string; name: string } | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
