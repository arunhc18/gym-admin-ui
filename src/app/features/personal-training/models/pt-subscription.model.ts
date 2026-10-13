export type PtSubscriptionStatus =
  | 'Active'
  | 'Completed'
  | 'Expired'
  | 'Cancelled';


export interface PtSubscription {

  ptSubscriptionId: number;

  tenantId: number;

  memberId: number;

  packageId: number;

  trainerId: number | null;

  purchaseDate: string;

  startDate: string;

  endDate: string;

  totalSessions: number;

  completedSessions: number;

  remainingSessions: number;

  status: PtSubscriptionStatus;

  createdAt?: string;

  updatedAt?: string;

}


export interface CreatePtSubscriptionRequest {

  tenantId: number;

  memberId: number;

  packageId: number;

  trainerId: number;

  purchaseDate: string;

  startDate: string;

  endDate: string;

  totalSessions: number;

  completedSessions: number;

  remainingSessions: number;

  status: PtSubscriptionStatus;

}


export interface UpdatePtSubscriptionRequest
  extends CreatePtSubscriptionRequest {

  ptSubscriptionId: number;

}