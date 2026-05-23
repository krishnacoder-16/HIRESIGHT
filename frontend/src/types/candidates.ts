export interface Candidate {
  id: string;
  candidateName: string;
  phoneNumber: string;
  emailId: string;
  recruiterName: string;
  companyName: string;
  companySpoc: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface CandidateFilters {
  recruiters: string[];
  companies: string[];
}

export interface CandidateResponse {
  data: Candidate[];
  pagination: PaginationInfo;
  filters: CandidateFilters;
}
