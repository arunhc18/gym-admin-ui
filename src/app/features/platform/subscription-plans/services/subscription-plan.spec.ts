import { TestBed } from '@angular/core/testing';
import { SubscriptionPlan } from './subscription-plan';

describe('SubscriptionPlan', () => {
  let service: SubscriptionPlan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionPlan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
