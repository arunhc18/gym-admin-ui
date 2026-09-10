import { Injectable } from '@angular/core';

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Converted'
  | 'Lost';

export interface Enquiry {
  enquiryId: number;
  name: string;
  phone: string;
  email: string;
  interestedPlan: string;
  source: string;
  enquiryDate: string;
  followUpDate: string;
  status: EnquiryStatus;
  notes: string;
}

export type CreateEnquiry = Omit<
  Enquiry,
  'enquiryId' | 'enquiryDate' | 'status'
> & Partial<Pick<Enquiry, 'enquiryDate' | 'status'>>;

export type UpdateEnquiry = Partial<Omit<Enquiry, 'enquiryId'>>;

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  private enquiries: Enquiry[] = this.createDummyEnquiries(80);

  getEnquiries(): Enquiry[] {
    return this.enquiries.map(enquiry => ({ ...enquiry }));
  }

  getEnquiryById(id: number): Enquiry | undefined {
    return this.enquiries.find(enquiry => enquiry.enquiryId === id);
  }

  createEnquiry(enquiry: CreateEnquiry): Enquiry {
    const nextId = this.enquiries.length
      ? Math.max(...this.enquiries.map(item => item.enquiryId)) + 1
      : 1;
    const created: Enquiry = {
      ...enquiry,
      enquiryId: nextId,
      enquiryDate: enquiry.enquiryDate ?? this.today(),
      status: enquiry.status ?? 'New'
    };

    this.enquiries.unshift(created);
    return { ...created };
  }

  updateEnquiry(id: number, changes: UpdateEnquiry): Enquiry | undefined {
    const index = this.enquiries.findIndex(item => item.enquiryId === id);
    if (index === -1) {
      return undefined;
    }

    this.enquiries[index] = {
      ...this.enquiries[index],
      ...changes,
      enquiryId: id
    };
    return { ...this.enquiries[index] };
  }

  private createDummyEnquiries(count: number): Enquiry[] {
    const names = [
      'Aarav Mehta', 'Diya Shah', 'Kabir Rao', 'Meera Nair',
      'Rohan Das', 'Isha Kapoor', 'Aditya Menon', 'Nisha Kumar'
    ];
    const plans = ['Monthly', 'Quarterly', 'Gold Annual', 'Premium Annual'];
    const sources = ['Website', 'Walk-in', 'Instagram', 'Referral', 'Google', 'Other'];
    const statuses: EnquiryStatus[] = ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'];

    return Array.from({ length: count }, (_, index) => {
      const name = names[index % names.length];
      const date = new Date();
      date.setDate(date.getDate() - (index % 45));
      const followUp = new Date(date);
      followUp.setDate(followUp.getDate() + ((index % 7) + 1));

      return {
        enquiryId: index + 1,
        name,
        phone: `98${String(76543210 + index).slice(-8)}`,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        interestedPlan: plans[index % plans.length],
        source: sources[index % sources.length],
        enquiryDate: this.toDate(date),
        followUpDate: index % 3 === 0 ? this.toDate(followUp) : '',
        status: statuses[index % statuses.length],
        notes: index % 4 === 0 ? 'Requested a weekday morning callback.' : ''
      };
    });
  }

  private today(): string {
    return this.toDate(new Date());
  }

  private toDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
