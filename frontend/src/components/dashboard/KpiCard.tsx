import { KpiData } from '@/types';

export function KpiCard({ title, value, subtitle, icon: Icon, iconBgColor, iconColor }: KpiData) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        <p className="text-[28px] leading-tight font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
