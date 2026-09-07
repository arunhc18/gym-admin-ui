import { MemberStatus } from './member.model';

export interface MemberListItem {
  memberId: number;
  memberCode: string;

  firstName: string;
  lastName: string;

  phone: string;
  email?: string;

  planName: string;
  location: string;

  joinDate: string;
  expiryDate: string;

  status: MemberStatus;
}