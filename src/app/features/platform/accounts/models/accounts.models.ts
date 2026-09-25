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


export type InvoiceType =
  | 'membership'
  | 'pt_package'
  | 'retail'
  | 'other';


export type InvoiceStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'cancelled';


export type InvoiceItemType =
  | 'membership'
  | 'pt_session'
  | 'product'
  | 'service';


export type ReminderChannel =
  | 'email'
  | 'sms';


// =====================================================
// PAYMENT METHOD
// =====================================================

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


// =====================================================
// INVOICE
// =====================================================

export interface Invoice {

  invoiceId: number;

  tenantId: number;

  locationId: number;

  invoiceNumber: string;

  invoiceDate: string;

  memberId?: number | null;

  invoiceType: InvoiceType;

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  totalAmount: number;

  paidAmount: number;

  balanceAmount: number;

  status: InvoiceStatus;

  dueDate?: string | null;

  notes?: string | null;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;

}


// =====================================================
// INVOICE ITEM
// =====================================================

export interface InvoiceItem {

  invoiceItemId: number;

  invoiceId: number;

  itemDescription: string;

  itemType?: InvoiceItemType | null;

  referenceId?: number | null;

  quantity: number;

  unitPrice: number;

  discountAmount: number;

  taxPercentage: number;

  taxAmount: number;

  totalAmount: number;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


// =====================================================
// PAYMENT
// =====================================================

export interface Payment {

  paymentId: number;

  tenantId: number;

  locationId: number;

  paymentNumber: string;

  paymentDate: string;

  memberId?: number | null;

  invoiceId?: number | null;

  paymentMethodId: number;

  amount: number;

  transactionId?: string | null;

  paymentStatus: PaymentStatus;

  referenceNumber?: string | null;

  notes?: string | null;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


// =====================================================
// CREATE PAYMENT REQUEST
// =====================================================

export interface PaymentRequest {

  tenantId: number;

  locationId: number;

  paymentNumber: string;

  paymentDate: string;

  memberId?: number | null;

  invoiceId?: number | null;

  paymentMethodId: number;

  amount: number;

  transactionId?: string | null;

  paymentStatus: PaymentStatus;

  referenceNumber?: string | null;

  notes?: string | null;

}


// =====================================================
// REFUND
// =====================================================

export interface Refund {

  refundId: number;

  paymentId: number;

  refundDate: string;

  refundAmount: number;

  refundReason?: string | null;

  refundStatus: string;

  processedDate?: string | null;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


// =====================================================
// REMINDER
// =====================================================

export interface ReminderResult {

  success: boolean;

  message: string;

}