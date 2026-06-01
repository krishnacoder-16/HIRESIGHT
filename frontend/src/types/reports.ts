export interface PaginationData {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ReportResponse<T> {
  data: T[];
  pagination: PaginationData;
  filters: Record<string, any>;
  meta: Record<string, any>;
}

export interface ClosedPosition {
  company: string;
  role: string;
  companySpoc: string;
  recruiters: string[];
  totalCvs: number;
  joinedCandidates: number;
  closureDate: string;
}

export interface JoinedCandidate {
  candidateName: string;
  company: string;
  role: string;
  companySpoc: string;
  recruiter: string;
  joiningDate: string;
}

export interface RejectionAnalysis {
  company: string;
  role: string;
  recruiter: string[];
  rejected: number;
  dropped: number;
  noResponse: number;
  notInterested: number;
  totalFailed: number;
  totalCandidates: number;
  rejectionPercentage: number;
}

export interface OfferRollout {
  candidateName: string;
  company: string;
  role: string;
  companySpoc: string;
  recruiter: string;
  offerStatus: string;
  joiningStatus: string;
}

export interface InternalClosure {
  company: string;
  role: string;
  companySpoc: string;
  recruiters: string[];
  totalCvs: number;
  closureReason: string;
}
