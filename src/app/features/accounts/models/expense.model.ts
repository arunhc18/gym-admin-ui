export type ExpenseStatus =
  | 'pending'
  | 'approved'
  | 'cancelled';


export interface Expense {

  expenseId: number;

  tenantId: number;

  locationId: number;

  expenseDate: string;

  category: string;

  description: string;

  amount: number;

  paymentMethodId:
    number | null;

  payee:
    string | null;

  referenceNumber:
    string | null;

  notes:
    string | null;

  status:
    ExpenseStatus;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


export interface CreateExpenseRequest {

  tenantId: number;

  locationId: number;

  expenseDate: string;

  category: string;

  description: string;

  amount: number;

  paymentMethodId:
    number | null;

  payee:
    string | null;

  referenceNumber:
    string | null;

  notes:
    string | null;

}