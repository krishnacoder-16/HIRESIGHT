import { LucideIcon } from 'lucide-react';
import React from 'react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  helperText: string;
  children?: React.ReactNode;
}

export function SectionCard({ title, icon: Icon, helperText, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-sm p-6 flex flex-col h-full min-h-[360px] group">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
        <h2 className="text-[16px] font-semibold text-slate-900 tracking-tight">{title}</h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center pb-6">
        {children ? (
          children
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
              <Icon className="w-5 h-5 text-slate-400 stroke-[1.5]" />
            </div>
            <p className="text-[14px] font-medium text-slate-600 tracking-tight">{title} will appear here</p>
            <p className="text-[13px] text-slate-400 mt-1 font-medium tracking-tight">{helperText}</p>
          </>
        )}
      </div>
    </div>
  );
}
