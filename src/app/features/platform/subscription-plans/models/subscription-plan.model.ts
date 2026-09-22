export type SubscriptionBillingPeriod =
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'annual';


export interface SubscriptionPlan {

  subscriptionPlanId: number;

  planCode: string;

  planName: string;

  description?: string;

  maxLocations: number;

  maxMembers: number;

  maxStaffUsers?: number | null;

  priceMonthly?: number | null;

  priceQuarterly?: number | null;

  priceHalfYearly?: number | null;

  priceAnnual?: number | null;

  isActive: boolean;

  displayOrder: number;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface SubscriptionPlanRequest {

  planCode: string;

  planName: string;

  description?: string;

  maxLocations: number;

  maxMembers: number;

  maxStaffUsers?: number | null;

  priceMonthly?: number | null;

  priceQuarterly?: number | null;

  priceHalfYearly?: number | null;

  priceAnnual?: number | null;

  isActive: boolean;

  displayOrder: number;
}