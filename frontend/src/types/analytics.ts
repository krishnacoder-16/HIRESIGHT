export interface Kpis {
  openRoles: number;
  l1Shortlisted: number;
  l2Shortlisted: number;
  offered: number;
  joined: number;
  positionsClosed: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface TopCompany {
  company: string;
  count: number;
}

export interface CompanyDistribution {
  topCompany: string;
  totalCandidates: number;
  totalRoles: number;
  topCompanies: TopCompany[];
}

export interface DashboardData {
  kpis: Kpis;
  funnel: FunnelStage[];
  companyDistribution: CompanyDistribution;
  metadata?: {
    filename: string;
    processedRows: number;
    processedTimestamp: string;
  };
}
