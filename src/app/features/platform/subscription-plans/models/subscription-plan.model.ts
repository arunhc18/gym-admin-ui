export type BillingCycle =
  | 'monthly'
  | 'yearly'
  | 'lifetime';


export interface SubscriptionPlan {

  subscriptionPlanId: number;

  planCode: string;

  planName: string;

  description?: string;

  maxLocations: number;

  maxMembers: number;

  maxStaffUsers?: number | null;

  priceMonthly?: number | null;

  priceYearly?: number | null;

  billingCycle: BillingCycle;

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

  priceYearly?: number | null;

  billingCycle: BillingCycle;

  isActive: boolean;

  displayOrder: number;
}