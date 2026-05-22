export interface Kpis {
  totalCandidates: number;
  activePipeline: number;
  hold: number;
  rejected: number;
  offered: number;
  joined: number;
  positionsClosed: number;
  duplicateProfiles: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface TopCompany {
  company: string;
  count: number;
}

export interface DashboardData {
  kpis: Kpis;
  funnel: FunnelStage[];
  topCompanies: TopCompany[];
  metadata?: {
    filename: string;
    processedRows: number;
    processedTimestamp: string;
  };
}
