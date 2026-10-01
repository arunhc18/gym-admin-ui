import { TestBed } from '@angular/core/testing';
import { MembershipPlan } from './membership-plan';

describe('MembershipPlan', () => {
  let service: MembershipPlan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MembershipPlan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
