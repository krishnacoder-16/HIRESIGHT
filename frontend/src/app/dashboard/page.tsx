import { KpiCard } from '@/components/dashboard/KpiCard';
import { Users, Activity, PauseCircle, UserX, Gift, UserCheck, Briefcase, Copy, Upload, BarChart3, Building2 } from 'lucide-react';

const kpiData = [
  { title: 'Total Candidates', value: '0', subtitle: 'All time', icon: Users, iconBgColor: 'bg-orange-50/80', iconColor: 'text-orange-500' },
  { title: 'Active Pipeline', value: '0', subtitle: 'In progress', icon: Activity, iconBgColor: 'bg-orange-50/80', iconColor: 'text-orange-500' },
  { title: 'Hold', value: '0', subtitle: 'On hold', icon: PauseCircle, iconBgColor: 'bg-amber-50', iconColor: 'text-amber-500' },
  { title: 'Rejected', value: '0', subtitle: 'Not moving forward', icon: UserX, iconBgColor: 'bg-red-50', iconColor: 'text-red-500' },
  { title: 'Offered', value: '0', subtitle: 'Offer extended', icon: Gift, iconBgColor: 'bg-orange-50/80', iconColor: 'text-orange-500' },
  { title: 'Joined', value: '0', subtitle: 'Successfully joined', icon: UserCheck, iconBgColor: 'bg-green-50', iconColor: 'text-green-500' },
  { title: 'Positions Closed', value: '0', subtitle: 'Roles successfully filled', icon: Briefcase, iconBgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
  { title: 'Duplicate Profiles', value: '0', subtitle: 'Potential duplicates', icon: Copy, iconBgColor: 'bg-orange-50/80', iconColor: 'text-orange-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Good morning, <span className="text-orange-500">Recruiter Admin</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Here's your recruitment pipeline overview.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-orange-200 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-semibold shadow-sm text-sm">
          <Upload className="w-[18px] h-[18px]" />
          Upload Dataset
        </button>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>
      
      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] p-6 flex flex-col min-h-[320px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
            <h2 className="text-[17px] font-bold text-slate-900">Interview Funnel</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-8">
            <BarChart3 className="w-10 h-10 text-slate-400 mb-5" />
            <p className="text-sm font-semibold text-slate-600">Funnel chart will appear here</p>
            <p className="text-[13px] text-slate-400 mt-1">Upload your dataset to see the analytics</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] p-6 flex flex-col min-h-[320px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
            <h2 className="text-[17px] font-bold text-slate-900">Top Hiring Companies</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-8">
            <Building2 className="w-10 h-10 text-slate-400 mb-5" />
            <p className="text-sm font-semibold text-slate-600">Top hiring companies will appear here</p>
            <p className="text-[13px] text-slate-400 mt-1">Upload your dataset to see the analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
