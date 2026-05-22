"use client";

import { KpiCard } from '@/components/dashboard/KpiCard';
import { Users, Activity, PauseCircle, UserX, Gift, UserCheck, Briefcase, Copy, Building2, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

export default function DashboardPage() {
  const { dashboardData } = useDashboard();

  // Helper to safely get KPI value
  const getKpi = (key: keyof NonNullable<typeof dashboardData>['kpis']) => {
    return dashboardData ? dashboardData.kpis[key].toString() : '-';
  };

  const kpiData = [
    { title: 'Total Candidates', value: getKpi('totalCandidates'), subtitle: 'All candidate CV submissions processed in database', icon: Users, iconBgColor: 'bg-slate-100', iconColor: 'text-slate-500', borderColor: 'bg-slate-300' },
    { title: 'Active Pipeline', value: getKpi('activePipeline'), subtitle: 'Shortlisted & actively progressing through interviews', icon: Activity, iconBgColor: 'bg-blue-50', iconColor: 'text-blue-500', borderColor: 'bg-blue-400' },
    { title: 'Hold', value: getKpi('hold'), subtitle: 'Operationally paused — client hold, internal hold', icon: PauseCircle, iconBgColor: 'bg-amber-50', iconColor: 'text-amber-500', borderColor: 'bg-amber-400' },
    { title: 'Rejected, Drops & Not Interested', value: getKpi('rejected'), subtitle: 'All unsuccessful candidate outcomes', icon: UserX, iconBgColor: 'bg-red-50', iconColor: 'text-red-500', borderColor: 'bg-red-400' },
    { title: 'Offered Candidates', value: getKpi('offered'), subtitle: 'Active job offers extended to candidate pool', icon: Gift, iconBgColor: 'bg-orange-50', iconColor: 'text-orange-500', borderColor: 'bg-orange-400' },
    { title: 'Candidate Joined', value: getKpi('joined'), subtitle: 'Successfully placed and onboarded hires', icon: UserCheck, iconBgColor: 'bg-emerald-50', iconColor: 'text-emerald-500', borderColor: 'bg-emerald-400' },
    { title: 'Positions Closed', value: getKpi('positionsClosed'), subtitle: 'Roles filled internally or drive cancelled', icon: Briefcase, iconBgColor: 'bg-violet-50', iconColor: 'text-violet-500', borderColor: 'bg-violet-400' },
    { title: 'Duplicate Profiles', value: getKpi('duplicateProfiles'), subtitle: 'Duplicate CV submissions or already processed profiles', icon: Copy, iconBgColor: 'bg-amber-50', iconColor: 'text-amber-600', borderColor: 'bg-amber-500' },
  ];

  // Funnel logic
  const funnelStages = dashboardData ? dashboardData.funnel.map(stage => {
    const totalSubmitted = dashboardData.funnel.find(s => s.stage === "Total Submitted")?.count || 1;
    const pct = totalSubmitted > 0 ? Math.round((stage.count / totalSubmitted) * 100) : 0;
    return {
      label: stage.stage,
      value: stage.count,
      pct
    };
  }) : [
    { label: 'Total Submitted', value: 0, pct: 0 },
    { label: 'L1 Cleared', value: 0, pct: 0 },
    { label: 'L2 Cleared', value: 0, pct: 0 },
    { label: 'L3 Cleared', value: 0, pct: 0 },
    { label: 'Offered', value: 0, pct: 0 },
    { label: 'Joined', value: 0, pct: 0 },
  ];

  // Companies Logic
  const companyColors = ['bg-orange-500', 'bg-slate-700', 'bg-slate-400', 'bg-blue-500', 'bg-emerald-500'];
  const companies = dashboardData ? dashboardData.topCompanies.map((co, idx) => ({
    rank: idx + 1,
    name: co.company,
    count: co.count,
    color: companyColors[idx % companyColors.length]
  })) : [];

  return (
    <div className="space-y-5">
      
      {dashboardData?.metadata && (
        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mb-2 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200/60 inline-flex">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Currently viewing: <span className="text-slate-800 font-semibold">{dashboardData.metadata.filename}</span></span>
          <span className="text-slate-300">|</span>
          <span>{dashboardData.metadata.processedRows} rows processed</span>
        </div>
      )}

      {/* KPI Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.slice(0, 3).map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.slice(3, 6).map((kpi, i) => <KpiCard key={i + 3} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpiData.slice(6, 8).map((kpi, i) => <KpiCard key={i + 6} {...kpi} />)}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Interview Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 flex flex-col min-h-[300px]">
          <div className="mb-6">
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Interview Funnel</h2>
            <p className="text-[12px] text-slate-400 mt-0.5 font-medium">Progression and conversion rates across hiring stages</p>
          </div>
          
          <div className="space-y-5 flex-1">
            {funnelStages.map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold text-slate-700">{stage.label}</span>
                  <span className="text-[13px] font-bold text-slate-900 tabular-nums">{stage.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 flex flex-col min-h-[300px]">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-violet-50 flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5 text-violet-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Top Hiring Companies</h2>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">Top 5 client accounts by candidate volume</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {companies.length > 0 ? (
              companies.map((co) => (
                <div key={co.name} className="flex items-center justify-between py-2 border-b border-slate-100/80 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full ${co.color} text-white flex items-center justify-center text-[12px] font-bold shrink-0`}>
                      {co.rank}
                    </div>
                    <span className="text-[14px] font-semibold text-slate-700">{co.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[16px] font-bold text-slate-900 tabular-nums tracking-tight">{co.count}</span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">candidates</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-8">
                <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-[13px] font-semibold text-slate-600">No data available</p>
                <p className="text-[12px] font-medium text-slate-400">Upload a dataset to view top companies</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
