export type PtPackageType =
  'individual'
  | 'group';


export interface PtPackage {

  packageId: number;

  tenantId: number;

  locationId: number | null;

  packageName: string;

  description: string | null;

  totalSessions: number;

  validityDays: number;

  price: number;

  sessionDurationMinutes: number;

  packageType: PtPackageType;

  maxGroupSize: number | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

}


export interface CreatePtPackageRequest {

  tenantId: number;

  locationId: number | null;

  packageName: string;

  description: string | null;

  totalSessions: number;

  validityDays: number;

  price: number;

  sessionDurationMinutes: number;

  packageType: PtPackageType;

  maxGroupSize: number | null;

  isActive: boolean;

}


export interface UpdatePtPackageRequest
  extends CreatePtPackageRequest {

  packageId: number;

}