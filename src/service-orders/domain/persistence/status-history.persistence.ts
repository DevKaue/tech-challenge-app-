export interface PersistedStatusHistory {
  id: string;
  serviceOrderId: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string | null;
  notes: string | null;
  changedAt: Date;
}
