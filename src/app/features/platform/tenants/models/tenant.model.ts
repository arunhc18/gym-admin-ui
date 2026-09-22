export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export type TenantBillingCycle =
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'annual';


export interface Tenant {

  tenantId: number;

  tenantName: string;

  subdomain: string;

  subscriptionPlanId: number;

  subscriptionBillingCycle: TenantBillingCycle;

  subscriptionStatus: SubscriptionStatus;

  subscriptionStartDate: string;

  subscriptionEndDate?: string | null;

  maxLocations?: number | null;

  maxMembers?: number | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface TenantRequest {

  tenantName: string;

  subdomain: string;

  subscriptionPlanId: number;

  subscriptionBillingCycle: TenantBillingCycle;

  subscriptionStatus: SubscriptionStatus;

  subscriptionStartDate: string;

  subscriptionEndDate?: string | null;

  maxLocations?: number | null;

  maxMembers?: number | null;

  isActive: boolean;
}