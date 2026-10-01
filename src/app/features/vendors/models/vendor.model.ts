export interface Vendor {

  vendorId: number;

  tenantId: number;

  vendorName: string;

  vendorCode: string;

  contactPerson?: string | null;

  phone?: string | null;

  email?: string | null;

  address?: string | null;

  gstNumber?: string | null;

  paymentTerms?: string | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface VendorRequest {

  tenantId: number;

  vendorName: string;

  vendorCode: string;

  contactPerson?: string | null;

  phone?: string | null;

  email?: string | null;

  address?: string | null;

  gstNumber?: string | null;

  paymentTerms?: string | null;

  isActive: boolean;
}