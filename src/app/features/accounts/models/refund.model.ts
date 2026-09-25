export type RefundStatus =
  | 'pending'
  | 'processed'
  | 'rejected'
  | 'cancelled';


export interface Refund {

  refundId: number;

  paymentId: number;

  refundDate: string;

  refundAmount: number;

  refundReason:
    string | null;

  refundStatus:
    RefundStatus;

  processedDate:
    string | null;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


export interface CreateRefundRequest {

  paymentId: number;

  refundDate: string;

  refundAmount: number;

  refundReason:
    string;

}


export interface RefundView
  extends Refund {

  paymentNumber:
    string;

  invoiceId:
    number | null;

  invoiceNumber:
    string;

  memberId:
    number | null;

  paymentAmount:
    number;

  paymentMethodName:
    string;

}