export interface PersistedEstimate {
  id: string;
  serviceOrderId: string;
  status: string;
  totalAmount: number;
  validUntil: Date | null;
  approvedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
