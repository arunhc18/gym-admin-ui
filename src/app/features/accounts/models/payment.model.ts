export type PaymentMethodType =
  | 'cash'
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'wallet';


export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';


export interface PaymentMethod {

  paymentMethodId: number;

  tenantId: number;

  methodName: string;

  methodType: PaymentMethodType;

  isActive: boolean;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


export interface Payment {

  paymentId: number;

  tenantId: number;

  locationId: number;

  paymentNumber: string;

  paymentDate: string;

  memberId:
    number | null;

  invoiceId:
    number | null;

  paymentMethodId: number;

  amount: number;

  transactionId:
    string | null;

  paymentStatus:
    PaymentStatus;

  referenceNumber:
    string | null;

  notes:
    string | null;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


export interface CreatePaymentRequest {

  tenantId: number;

  locationId: number;

  paymentDate: string;

  memberId:
    number | null;

  invoiceId:
    number | null;

  paymentMethodId: number;

  amount: number;

  transactionId:
    string | null;

  paymentStatus:
    PaymentStatus;

  referenceNumber:
    string | null;

  notes:
    string | null;

}


export interface PaymentView
  extends Payment {

  paymentMethodName: string;

  invoiceNumber: string;

  /*
   * Alias used by the Refund page.
   */
  paymentAmount: number;

}