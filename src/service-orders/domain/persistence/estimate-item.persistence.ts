export interface PersistedEstimateItem {
  id: string;
  estimateId: string;
  itemType: string;
  referenceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}
