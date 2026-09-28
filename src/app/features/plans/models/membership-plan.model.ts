export type PlanDurationType =
  | 'days'
  | 'months'
  | 'years'
  | 'sessions';


export type PlanCategory =
  | 'membership'
  | 'personal_training';


export type PlanBillingCycle =
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly'
  | 'one_time';


export type PlanAccessType =
  | 'home_location'
  | 'all_locations';


export interface MembershipPlan {

  membershipPlanId: number;

  tenantId: number;

  planCategory: PlanCategory;

  planCode: string;

  planName: string;

  description: string | null;

  durationValue: number;

  durationType:
    PlanDurationType;

  billingCycle:
    PlanBillingCycle;

  price: number;

  joiningFee: number;

  discountAmount: number;

  taxPercentage: number;

  maxFreezeDays: number;

  maxFreezeCount: number;

  accessType:
    PlanAccessType;

  memberCount: number;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

}


export interface CreateMembershipPlanRequest {

  tenantId: number;

  planCategory: PlanCategory;

  planCode: string;

  planName: string;

  description: string | null;

  durationValue: number;

  durationType:
    PlanDurationType;

  billingCycle:
    PlanBillingCycle;

  price: number;

  joiningFee: number;

  discountAmount: number;

  taxPercentage: number;

  maxFreezeDays: number;

  maxFreezeCount: number;

  accessType:
    PlanAccessType;

}


export interface UpdateMembershipPlanRequest
  extends CreateMembershipPlanRequest {

  membershipPlanId: number;

}