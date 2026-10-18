export interface CurrentEmployerDto {
  id: string
  companyName: string
  verificationStatus: 'PendingVerification' | 'Verified' | 'Rejected'
  rejectionReason?: string | null
}
