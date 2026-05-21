import { UserCircle, ChevronDown } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-20 bg-transparent flex items-center justify-end px-8 z-10 relative">
      <div className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
        <UserCircle className="w-7 h-7 text-slate-400" />
        <span className="text-sm font-medium pr-1">Recruiter Admin</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>
    </header>
  );
}
