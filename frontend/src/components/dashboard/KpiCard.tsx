import { KpiData } from '@/types';

export function KpiCard({ title, value, subtitle, icon: Icon, iconBgColor, iconColor, borderColor }: KpiData) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 relative overflow-hidden group hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-300 cursor-default flex flex-col">
      {/* Accent Left Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${borderColor} rounded-l-2xl`} />
      
      <div className="p-5 pl-6 flex-1 flex flex-col">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-slate-800 tracking-tight mb-1">{title}</h3>
            <p className="text-[12px] font-medium text-slate-500 leading-snug line-clamp-2">{subtitle}</p>
          </div>
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${iconBgColor}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
          </div>
        </div>
        
        {/* Value */}
        <p className="text-[36px] font-bold text-slate-900 tracking-[-0.03em] leading-none mt-auto">{value}</p>
      </div>
    </div>
  );
}
