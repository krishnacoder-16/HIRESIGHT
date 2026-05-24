export interface Job {
  id: string;
  company: string;
  role: string;
  companySpoc: string;
  recruitersCount: number;
  recruiters: string[];
  totalCvs: number;
  activeCandidates: number;
  rejected: number;
  joined: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface JobFilters {
  companies: string[];
  recruiters: string[];
}

export interface JobResponse {
  data: Job[];
  pagination: PaginationInfo;
  filters: JobFilters;
}
