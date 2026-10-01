import { Injectable } from '@angular/core';

import { Staff, StaffService } from '../../features/staff/services/staff.service';
import { Trainer } from '../models/trainer.model';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  constructor(private readonly staffService: StaffService) {}

  getTrainers(): Trainer[] {
    return this.staffService
      .getStaffSnapshot()
      .filter(
        member =>
          member.role === 'Trainer' && member.status !== 'Inactive'
      )
      .map(member => ({
        trainerId: member.staffId,
        staffId: member.staffId,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: `${member.firstName} ${member.lastName}`,
        specialization: member.specialization ?? null,
        location: member.location,
        status: member.status as 'Active' | 'Inactive' | 'On Leave'
      }));
  }

  getTrainerById(trainerId: number | null): Trainer | undefined {
    if (trainerId === null || trainerId === undefined) {
      return undefined;
    }

    return this.getTrainers().find(item => item.trainerId === trainerId);
  }

  getTrainerLabel(trainerId: number | null): string {
    const trainer = this.getTrainerById(trainerId);

    return trainer ? trainer.fullName : 'Unassigned';
  }

  getTrainerRecords(): Staff[] {
    return this.staffService
      .getStaffSnapshot()
      .filter(item => item.role === 'Trainer');
  }
}
