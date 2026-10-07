export type PtSessionStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';


export interface PtSession {

  sessionId: number;

  ptSubscriptionId: number;

  trainerId: number;

  sessionDate: string;

  startTime: string;

  endTime: string;

  status: PtSessionStatus;

  notes: string | null;

  exercisesPerformed: string | null;

  feedback: string | null;

  createdAt?: string;

  updatedAt?: string;

}


export interface CreatePtSessionRequest {

  ptSubscriptionId: number;

  trainerId: number;

  sessionDate: string;

  startTime: string;

  endTime: string;

  status: PtSessionStatus;

  notes: string | null;

  exercisesPerformed: string | null;

  feedback: string | null;

}


export interface UpdatePtSessionRequest
  extends CreatePtSessionRequest {

  sessionId: number;

}