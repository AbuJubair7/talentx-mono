import {
  parseInterviewMetadata,
  parseJobInvitationMetadata,
  buildTalentInterviewsUrl,
  buildEmployerApplicantDetailUrl,
  buildJobInvitationUrl,
  parseNotificationMetadata,
  parseEmployerVerificationMetadata,
  parseJobReportMetadata,
  parseJobMetadata,
  buildMatchingJobsUrl,
  buildEmployerVerificationUrl,
  buildEmployerDashboardUrl,
  buildReportedJobsUrl,
  buildJobModerationUrl,
  buildEmployerJobUrl,
} from '../notification-metadata';

describe('notification-metadata utilities', () => {
  describe('parseInterviewMetadata', () => {
    it('returns null when metadata is null or empty', () => {
      expect(parseInterviewMetadata(null)).toBeNull();
      expect(parseInterviewMetadata('')).toBeNull();
      expect(parseInterviewMetadata('   ')).toBeNull();
    });

    it('parses complete interview metadata JSON correctly', () => {
      const metadataPayload = {
        invitationId: 'invitation-101',
        jobId: 'job-202',
        jobTitle: 'Senior Software Engineer',
        applicationId: 'application-303',
        companyName: 'Tech Innovations Ltd',
        candidateName: 'John Smith',
      };

      const parsedResult = parseInterviewMetadata(JSON.stringify(metadataPayload));

      expect(parsedResult).toEqual(metadataPayload);
    });

    it('parses partial interview metadata JSON correctly', () => {
      const partialPayload = {
        invitationId: 'invitation-101',
        jobId: 'job-202',
      };

      const parsedResult = parseInterviewMetadata(JSON.stringify(partialPayload));

      expect(parsedResult).toEqual(partialPayload);
    });

    it('parses a bare job ID string as an object with jobId', () => {
      const parsedBareId = parseInterviewMetadata('job-bare-999');
      expect(parsedBareId).toEqual({ jobId: 'job-bare-999' });

      const parsedQuotedId = parseInterviewMetadata('"job-quoted-999"');
      expect(parsedQuotedId).toEqual({ jobId: 'job-quoted-999' });
    });

    it('returns null for JSON numbers, booleans, or null literals', () => {
      expect(parseInterviewMetadata('42')).toBeNull();
      expect(parseInterviewMetadata('true')).toBeNull();
      expect(parseInterviewMetadata('null')).toBeNull();
    });
  });

  describe('parseJobInvitationMetadata', () => {
    it('returns null when metadata is null or empty', () => {
      expect(parseJobInvitationMetadata(null)).toBeNull();
      expect(parseJobInvitationMetadata('')).toBeNull();
      expect(parseJobInvitationMetadata('   ')).toBeNull();
    });

    it('parses complete job invitation metadata JSON correctly', () => {
      const invitationPayload = {
        invitationId: 'inv-101',
        jobId: 'job-202',
        jobTitle: 'Senior AI Engineer',
        companyName: 'Acme AI',
        token: 'token-abc-123',
      };

      expect(parseJobInvitationMetadata(JSON.stringify(invitationPayload))).toEqual(
        invitationPayload
      );
    });

    it('parses bare job ID string correctly', () => {
      expect(parseJobInvitationMetadata('job-bare-555')).toEqual({
        jobId: 'job-bare-555',
      });
    });

    it('returns null for invalid non-job-id literals', () => {
      expect(parseJobInvitationMetadata('42')).toBeNull();
      expect(parseJobInvitationMetadata('false')).toBeNull();
    });
  });

  describe('buildTalentInterviewsUrl', () => {
    it('returns the talent interviews route', () => {
      expect(buildTalentInterviewsUrl()).toBe('/interviews');
    });
  });

  describe('buildJobInvitationUrl', () => {
    it('returns job detail route with invitation token query parameter when both jobId and token are present', () => {
      const invitationMetadata = {
        jobId: 'job-123',
        token: 'inv-tok-456',
      };

      expect(buildJobInvitationUrl(invitationMetadata)).toBe(
        '/jobs/job-123?invitation=inv-tok-456'
      );
    });

    it('encodes special characters in jobId and token', () => {
      const invitationMetadata = {
        jobId: 'job/special 123',
        token: 'tok&special=1',
      };

      expect(buildJobInvitationUrl(invitationMetadata)).toBe(
        '/jobs/job%2Fspecial%20123?invitation=tok%26special%3D1'
      );
    });

    it('returns job route without token when only jobId is present', () => {
      expect(buildJobInvitationUrl({ jobId: 'job-123' })).toBe('/jobs/job-123');
    });

    it('returns fallback /jobs when metadata is null or missing jobId', () => {
      expect(buildJobInvitationUrl(null)).toBe('/jobs');
      expect(buildJobInvitationUrl(undefined)).toBe('/jobs');
      expect(buildJobInvitationUrl({})).toBe('/jobs');
      expect(buildJobInvitationUrl({ token: 'tok-only' })).toBe('/jobs');
    });
  });

  describe('buildEmployerApplicantDetailUrl', () => {
    it('returns applicant detail route when both jobId and applicationId are present', () => {
      const interviewMetadata = {
        jobId: 'job-123',
        applicationId: 'applicant-456',
      };

      expect(buildEmployerApplicantDetailUrl(interviewMetadata)).toBe(
        '/job/job-listing/job-123/applicants/applicant-456'
      );
    });

    it('encodes special characters in jobId and applicationId', () => {
      const interviewMetadataWithSpecialCharacters = {
        jobId: 'job/special 123',
        applicationId: 'applicant/special 456',
      };

      expect(buildEmployerApplicantDetailUrl(interviewMetadataWithSpecialCharacters)).toBe(
        '/job/job-listing/job%2Fspecial%20123/applicants/applicant%2Fspecial%20456'
      );
    });

    it('returns job detail route when only jobId is present', () => {
      const interviewMetadataWithoutApplicant = {
        jobId: 'job-123',
      };

      expect(buildEmployerApplicantDetailUrl(interviewMetadataWithoutApplicant)).toBe(
        '/job/job-listing/job-123'
      );
    });

    it('encodes special characters in jobId when applicationId is absent', () => {
      const interviewMetadataWithSpecialCharacters = {
        jobId: 'job/special 123',
      };

      expect(buildEmployerApplicantDetailUrl(interviewMetadataWithSpecialCharacters)).toBe(
        '/job/job-listing/job%2Fspecial%20123'
      );
    });

    it('returns default job listing route when only applicationId is present without jobId', () => {
      const interviewMetadataWithoutJob = {
        applicationId: 'applicant-456',
      };

      expect(buildEmployerApplicantDetailUrl(interviewMetadataWithoutJob)).toBe(
        '/job/job-listing'
      );
    });

    it('returns default job listing route when metadata is null or undefined', () => {
      expect(buildEmployerApplicantDetailUrl(null)).toBe('/job/job-listing');
      expect(buildEmployerApplicantDetailUrl(undefined)).toBe('/job/job-listing');
      expect(buildEmployerApplicantDetailUrl()).toBe('/job/job-listing');
      expect(buildEmployerApplicantDetailUrl({})).toBe('/job/job-listing');
    });
  });

  describe('parseNotificationMetadata', () => {
    it('returns parsed matching jobs metadata for valid JSON', () => {
      const matchingJobsPayload = {
        keyword: 'Engineer',
        location: 'Remote',
      };

      expect(parseNotificationMetadata(JSON.stringify(matchingJobsPayload))).toEqual(
        matchingJobsPayload
      );
    });

    it('returns null for invalid or null metadata', () => {
      expect(parseNotificationMetadata(null)).toBeNull();
      expect(parseNotificationMetadata('invalid-json')).toBeNull();
      expect(parseNotificationMetadata('123')).toBeNull();
    });
  });

  describe('parseEmployerVerificationMetadata', () => {
    it('returns parsed employer metadata for valid JSON', () => {
      const employerPayload = {
        employerId: 'emp-1',
        employerName: 'Alice',
        companyName: 'Acme',
      };

      expect(parseEmployerVerificationMetadata(JSON.stringify(employerPayload))).toEqual(
        employerPayload
      );
    });

    it('returns null for invalid or null metadata', () => {
      expect(parseEmployerVerificationMetadata(null)).toBeNull();
      expect(parseEmployerVerificationMetadata('invalid-json')).toBeNull();
      expect(parseEmployerVerificationMetadata('42')).toBeNull();
    });
  });

  describe('parseJobReportMetadata', () => {
    it('returns parsed job report metadata', () => {
      const reportPayload = { jobId: 'job-1', reportId: 'rep-1' };
      expect(parseJobReportMetadata(JSON.stringify(reportPayload))).toEqual(reportPayload);
    });
  });

  describe('parseJobMetadata', () => {
    it('returns parsed job metadata', () => {
      const jobPayload = { jobId: 'job-1', jobTitle: 'Title' };
      expect(parseJobMetadata(JSON.stringify(jobPayload))).toEqual(jobPayload);
    });
  });

  describe('buildMatchingJobsUrl', () => {
    it('builds query parameters correctly', () => {
      expect(
        buildMatchingJobsUrl({
          keyword: 'React',
          location: 'Remote',
        })
      ).toBe('/jobs?keyword=React&location=Remote');
    });

    it('returns null when no parameters are present', () => {
      expect(buildMatchingJobsUrl({})).toBeNull();
    });
  });

  describe('buildEmployerVerificationUrl', () => {
    it('builds admin employer verification route with encoded highlight ID', () => {
      expect(buildEmployerVerificationUrl({ employerId: 'emp/123' })).toBe(
        '/admin/employers?highlight=emp%2F123'
      );
    });

    it('returns null when employerId is absent', () => {
      expect(buildEmployerVerificationUrl({})).toBeNull();
    });
  });

  describe('buildEmployerDashboardUrl', () => {
    it('returns dashboard route', () => {
      expect(buildEmployerDashboardUrl()).toBe('/dashboard');
    });
  });

  describe('buildReportedJobsUrl', () => {
    it('returns reported jobs route', () => {
      expect(buildReportedJobsUrl()).toBe('/admin/reported-jobs');
    });
  });

  describe('buildJobModerationUrl', () => {
    it('returns admin jobs route with job parameter when jobId is provided', () => {
      expect(buildJobModerationUrl({ jobId: 'job-1' })).toBe('/admin/jobs?job=job-1');
    });

    it('returns admin jobs route without parameter when jobId is absent', () => {
      expect(buildJobModerationUrl()).toBe('/admin/jobs');
    });
  });

  describe('buildEmployerJobUrl', () => {
    it('returns job detail route when jobId is provided', () => {
      expect(buildEmployerJobUrl({ jobId: 'job-1' }, 'Active')).toBe(
        '/job/job-listing/job-1'
      );
    });

    it('returns filtered job listing route when jobId is absent', () => {
      expect(buildEmployerJobUrl(null, 'Deactivated')).toBe(
        '/job/job-listing?status=Deactivated'
      );
    });
  });
});
