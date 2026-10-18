export type InterviewType = 'OnlineAssessment' | 'OnCall' | 'OnSite';
export type InterviewStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';

export type DisplayStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'completed' | 'cancelled';
export type InterviewFilter = 'all' | 'pending' | 'accepted' | 'declined';

export interface InterviewTimeslotDto {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  meetingUrl: string | null;
}

export interface TalentInterviewDto {
  id: string;
  jobId: string;
  jobApplicationId: string;
  jobTitle: string;
  companyName: string;
  type: InterviewType;
  status: InterviewStatus;
  assessmentUrl: string | null;
  assessmentDeadline: string | null;
  locationOrLink: string | null;
  instructions: string | null;
  selectedTimeslotId: string | null;
  scheduledAt: string | null;
  sentAt: string;
  respondedAt: string | null;
  timeslots: InterviewTimeslotDto[];
}

export interface PaginatedInterviewList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetMyInterviewsQueryParams {
  page?: number;
  pageSize?: number;
}

export interface AcceptInterviewPayload {
  selectedTimeslotId?: string;
}

export interface DeclineInterviewPayload {
  reason?: string;
}

export interface InterviewActionResponse {
  message?: string;
}

export interface InterviewStatusStyleConfig {
  label: string;
  bg: string;
  dot: string;
}
