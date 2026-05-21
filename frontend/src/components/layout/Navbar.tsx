import { UserCircle, Upload } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-[68px] bg-white/60 backdrop-blur-sm border-b border-slate-200/50 flex items-center justify-between px-8 z-10 relative shrink-0">
      <div>
        <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">Recruitment Analytics</h1>
        <p className="text-[13px] text-slate-500 font-medium mt-0.5">
          Real-time pipeline intelligence — messy data, <span className="text-orange-600 font-semibold">clean insights</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-semibold text-[13px] tracking-tight shadow-sm group">
          <Upload className="w-3.5 h-3.5 text-orange-500 group-hover:-translate-y-0.5 transition-transform" />
          Upload Different Dataset
        </button>
        <div className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-900 transition-colors px-1.5 py-1 rounded-full hover:bg-black/5">
          <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center shadow-sm">
            <span className="text-orange-600 font-bold text-[13px]">N</span>
          </div>
        </div>
      </div>
    </header>
  );
}
