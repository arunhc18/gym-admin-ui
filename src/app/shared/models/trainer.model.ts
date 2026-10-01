export interface Trainer {
  trainerId: number;
  staffId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  specialization?: string | null;
  location?: string | null;
  status: 'Active' | 'Inactive' | 'On Leave';
}
