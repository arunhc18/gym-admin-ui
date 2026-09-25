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


/* =====================================================
   INVOICE ITEM
===================================================== */

export interface InvoiceItem {

  invoiceItemId: number;

  invoiceId: number;

  itemDescription: string;

  itemType:
    InvoiceItemType | null;

  referenceId:
    number | null;

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


/* =====================================================
   INVOICE
===================================================== */

export interface Invoice {

  invoiceId: number;

  tenantId: number;

  locationId: number;

  invoiceNumber: string;

  invoiceDate: string;

  memberId:
    number | null;

  invoiceType:
    InvoiceType;

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  totalAmount: number;

  paidAmount: number;

  balanceAmount: number;

  status:
    InvoiceStatus;

  dueDate:
    string | null;

  notes:
    string | null;

  createdAt?: string;

  createdBy?: number | null;

  updatedAt?: string;

  updatedBy?: number | null;

}


/* =====================================================
   CREATE INVOICE ITEM REQUEST
===================================================== */

export interface CreateInvoiceItemRequest {

  itemDescription: string;

  itemType:
    InvoiceItemType;

  referenceId:
    number | null;

  quantity: number;

  unitPrice: number;

  discountAmount: number;

  taxPercentage: number;

}


/* =====================================================
   CREATE INVOICE REQUEST
===================================================== */

export interface CreateInvoiceRequest {

  tenantId: number;

  locationId: number;

  invoiceDate: string;

  memberId:
    number | null;

  invoiceType:
    InvoiceType;

  dueDate:
    string | null;

  notes:
    string | null;

  items:
    CreateInvoiceItemRequest[];

}


/* =====================================================
   CALCULATED TOTALS
===================================================== */

export interface InvoiceTotals {

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  totalAmount: number;

}


/* =====================================================
   INVOICE WITH ITEMS
===================================================== */

export interface InvoiceDetails {

  invoice: Invoice;

  items: InvoiceItem[];

}