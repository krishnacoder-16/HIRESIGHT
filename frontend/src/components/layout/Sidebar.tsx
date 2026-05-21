import Link from 'next/link';
import { LayoutGrid, ChevronsLeft } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="flex flex-col w-[280px] bg-white h-screen border-r border-slate-100 relative z-20">
      <div className="flex items-center h-24 px-8">
        <h1 className="text-[26px] font-black text-slate-900 tracking-tight flex items-center">
          HIRE<span className="text-orange-500">SIGHT</span>
        </h1>
      </div>
      <nav className="flex-1 py-2">
        <ul className="px-4">
          <li>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-900 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm border border-transparent hover:border-slate-100">
              <div className="bg-orange-500 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                <LayoutGrid className="w-[18px] h-[18px] text-white" />
              </div>
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Bottom Collapse Button */}
      <div className="p-6 mt-auto flex items-center gap-3 group cursor-pointer">
        <button className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm group-hover:bg-slate-50 text-slate-600 transition-all">
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity absolute left-16">
          Collapse
        </div>
      </div>
    </div>
  );
}
