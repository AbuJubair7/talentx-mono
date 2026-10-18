export type InterviewType = 'OnlineAssessment' | 'OnCall' | 'OnSite';
export type InterviewStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';

export const ALL_INTERVIEW_STATUS_FILTER_VALUE = 'All' as const;
export type InterviewStatusFilter = InterviewStatus | typeof ALL_INTERVIEW_STATUS_FILTER_VALUE;

export const ALL_INTERVIEW_TYPE_FILTER_VALUE = 'All' as const;
export type InterviewTypeFilter = InterviewType | typeof ALL_INTERVIEW_TYPE_FILTER_VALUE;

export interface InterviewTimeslotDto {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  meetingUrl: string | null;
}

export interface EmployerInterviewDto {
  id: string;
  jobId: string;
  jobApplicationId: string;
  talentUserId: string;
  applicantName: string;
  applicantEmail: string;
  type: InterviewType;
  status: InterviewStatus;
  assessmentUrl: string | null;
  assessmentDeadline: string | null;
  locationOrLink: string | null;
  instructions: string | null;
  declineReason: string | null;
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

export interface GetJobInterviewsQueryParams {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface TimeslotInput {
  startTime: string;
  endTime: string;
  meetingUrl?: string;
}

export interface SendInterviewBatchPayload {
  applicationIds: string[];
  type: InterviewType;
  assessmentUrl?: string;
  assessmentDeadline?: string;
  locationOrLink?: string;
  instructions?: string;
  timeslots?: TimeslotInput[];
  force?: boolean;
}

export interface CandidateInvitationResultDto {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  success: boolean;
  invitationId?: string | null;
  skipReason?: string | null;
  canForceSend: boolean;
  hasDanglingPendingInvite: boolean;
}

export interface SendInterviewBatchResponse {
  totalProcessed: number;
  invitedCount: number;
  skippedCount: number;
  results: CandidateInvitationResultDto[];
}

export interface InterviewTypeOption {
  value: InterviewType;
  label: string;
}

export interface InterviewStatusOption {
  value: InterviewStatus;
  label: string;
}

export interface InterviewStatusStyleConfig {
  label: string;
  bg: string;
  dot: string;
  rail: string;
}
