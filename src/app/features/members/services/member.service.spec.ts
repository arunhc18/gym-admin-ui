import { TestBed } from '@angular/core/testing';

import {
  CreateMember,
  MemberService
} from './member.service';

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(MemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the initial members', () => {
    const members = service.getMembers();

    expect(members.length).toBe(12);
  });

  it('should return a member by id', () => {
    const member = service.getMemberById(1);

    expect(member).toBeTruthy();
    expect(member?.firstName).toBe('Arun');
    expect(member?.lastName).toBe('Kumar');
  });

  it('should return undefined for an unknown member id', () => {
    const member = service.getMemberById(999);

    expect(member).toBeUndefined();
  });

  it('should create a new member', () => {
    const newMember: CreateMember = {
      memberCode: 'MEM-00136',
      firstName: 'Test',
      lastName: 'Member',
      phone: '9999999999',
      email: 'test@example.com'
    };

    const created = service.createMember(newMember);

    expect(created.memberId).toBe(13);
    expect(created.memberCode).toBe('MEM-00136');
    expect(created.firstName).toBe('Test');
    expect(created.status).toBe('Active');
  });

  it('should update an existing member', () => {
    const updated = service.updateMember(1, {
      firstName: 'Updated'
    });

    expect(updated).toBeTruthy();
    expect(updated?.firstName).toBe('Updated');
    expect(updated?.lastName).toBe('Kumar');
  });

  it('should return undefined when updating an unknown member', () => {
    const updated = service.updateMember(999, {
      firstName: 'Updated'
    });

    expect(updated).toBeUndefined();
  });

  it('should deactivate an existing member', () => {
    const deactivated = service.deactivateMember(1);

    expect(deactivated).toBeTruthy();
    expect(deactivated?.status).toBe('Inactive');
  });

  it('should return undefined when deactivating an unknown member', () => {
    const deactivated = service.deactivateMember(999);

    expect(deactivated).toBeUndefined();
  });
});