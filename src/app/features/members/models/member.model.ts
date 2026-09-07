export type MemberStatus =
  | 'Active'
  | 'Expiring'
  | 'Expired'
  | 'Inactive';

export interface Member {
  memberId: number;
  tenantId?: number;
  userId?: number;
  locationId?: number;

  memberCode: string;

  firstName: string;
  lastName: string;

  dateOfBirth?: string;
  gender?: string;

  email?: string;
  phone: string;
  alternatePhone?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  bloodGroup?: string;

  photoUrl?: string;

  idProofType?: string;
  idProofNumber?: string;

  status: MemberStatus;
}