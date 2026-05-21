import { KpiCard } from '@/components/dashboard/KpiCard';
import { Users, Activity, PauseCircle, UserX, Gift, UserCheck, Briefcase, Copy, Building2 } from 'lucide-react';

const kpiData = [
  { title: 'Total Candidates', value: '462', subtitle: 'All candidate CV submissions processed in database', icon: Users, iconBgColor: 'bg-slate-100', iconColor: 'text-slate-500', borderColor: 'bg-slate-300' },
  { title: 'Active Pipeline', value: '111', subtitle: 'Shortlisted & actively progressing through interviews', icon: Activity, iconBgColor: 'bg-blue-50', iconColor: 'text-blue-500', borderColor: 'bg-blue-400' },
  { title: 'Hold', value: '48', subtitle: 'Operationally paused — client hold, internal hold', icon: PauseCircle, iconBgColor: 'bg-amber-50', iconColor: 'text-amber-500', borderColor: 'bg-amber-400' },
  { title: 'Rejected, Drops & Not Interested', value: '154', subtitle: 'All unsuccessful candidate outcomes', icon: UserX, iconBgColor: 'bg-red-50', iconColor: 'text-red-500', borderColor: 'bg-red-400' },
  { title: 'Offered Candidates', value: '1', subtitle: 'Active job offers extended to candidate pool', icon: Gift, iconBgColor: 'bg-orange-50', iconColor: 'text-orange-500', borderColor: 'bg-orange-400' },
  { title: 'Candidate Joined', value: '3', subtitle: 'Successfully placed and onboarded hires', icon: UserCheck, iconBgColor: 'bg-emerald-50', iconColor: 'text-emerald-500', borderColor: 'bg-emerald-400' },
  { title: 'Positions Closed', value: '25', subtitle: 'Roles filled internally or drive cancelled', icon: Briefcase, iconBgColor: 'bg-violet-50', iconColor: 'text-violet-500', borderColor: 'bg-violet-400' },
  { title: 'Duplicate Profiles', value: '59', subtitle: 'Duplicate CV submissions or already processed profiles', icon: Copy, iconBgColor: 'bg-amber-50', iconColor: 'text-amber-600', borderColor: 'bg-amber-500' },
];

// Funnel stages data
const funnelStages = [
  { label: 'Total Submitted', value: 462, pct: 100 },
  { label: 'L1 Cleared', value: 54, pct: 12 },
  { label: 'L2 Cleared', value: 7, pct: 3 },
  { label: 'L3 Cleared', value: 6, pct: 2 },
];

// Companies data
const companies = [
  { rank: 1, name: 'IVP', count: 161, color: 'bg-orange-500' },
  { rank: 2, name: 'Ekaggata', count: 81, color: 'bg-slate-700' },
  { rank: 3, name: 'HCL', count: 30, color: 'bg-slate-400' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">

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
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          <div className="mb-6">
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Interview Funnel</h2>
            <p className="text-[12px] text-slate-400 mt-0.5 font-medium">Progression and conversion rates across hiring stages</p>
          </div>
          
          <div className="space-y-5">
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
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-violet-50 flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5 text-violet-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Top Hiring Companies</h2>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">Top 5 client accounts by candidate volume</p>
            </div>
          </div>

          <div className="space-y-4">
            {companies.map((co) => (
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
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
