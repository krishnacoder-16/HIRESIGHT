"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, PanelLeftClose, PanelLeftOpen, Users, Briefcase, FileText, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col bg-[#0D0D12] h-screen relative z-20 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-[68px]" : "w-56"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center h-[68px] border-b border-white/[0.06]",
        isCollapsed ? "justify-center" : "px-5"
      )}>
        {isCollapsed ? (
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-[15px] tracking-tight">H</span>
          </div>
        ) : (
          <h1 className="text-[18px] font-bold text-white tracking-[-0.03em]">
            HIRE<span className="text-orange-500">SIGHT</span>
          </h1>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2.5">
        <p className={cn(
          "text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-3 px-2 transition-opacity duration-200",
          isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
        )}>Menu</p>
        <ul className="space-y-1.5">
          <li>
            <Link href="/dashboard" className={cn(
              "flex items-center text-white/60 hover:text-white rounded-[12px] hover:bg-white/[0.07] transition-all duration-200 font-medium text-[14px] tracking-tight",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              pathname === '/dashboard' ? "bg-white/[0.10] text-white" : ""
            )}>
              <div className={cn("rounded-[8px] p-1.5 flex items-center justify-center shrink-0", pathname === '/dashboard' ? "bg-orange-500" : "bg-white/[0.05]")}>
                <LayoutGrid className="w-[15px] h-[15px] text-white" />
              </div>
              {!isCollapsed && <span className="text-[14px] font-semibold">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link href="/candidate-pipeline" className={cn(
              "flex items-center text-white/60 hover:text-white rounded-[12px] hover:bg-white/[0.07] transition-all duration-200 font-medium text-[14px] tracking-tight",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              pathname === '/candidate-pipeline' ? "bg-white/[0.10] text-white" : ""
            )}>
              <div className={cn("rounded-[8px] p-1.5 flex items-center justify-center shrink-0", pathname === '/candidate-pipeline' ? "bg-orange-500" : "bg-white/[0.05]")}>
                <Users className="w-[15px] h-[15px] text-white" />
              </div>
              {!isCollapsed && <span className="text-[14px] font-semibold">Candidate Pipeline</span>}
            </Link>
          </li>
          <li>
            <Link href="/jobs" className={cn(
              "flex items-center text-white/60 hover:text-white rounded-[12px] hover:bg-white/[0.07] transition-all duration-200 font-medium text-[14px] tracking-tight",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              pathname === '/jobs' ? "bg-white/[0.10] text-white" : ""
            )}>
              <div className={cn("rounded-[8px] p-1.5 flex items-center justify-center shrink-0", pathname === '/jobs' ? "bg-orange-500" : "bg-white/[0.05]")}>
                <Briefcase className="w-[15px] h-[15px] text-white" />
              </div>
              {!isCollapsed && <span className="text-[14px] font-semibold">Jobs</span>}
            </Link>
          </li>
          <li>
            <Link href="/reports" className={cn(
              "flex items-center text-white/60 hover:text-white rounded-[12px] hover:bg-white/[0.07] transition-all duration-200 font-medium text-[14px] tracking-tight",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              pathname === '/reports' ? "bg-white/[0.10] text-white" : ""
            )}>
              <div className={cn("rounded-[8px] p-1.5 flex items-center justify-center shrink-0", pathname === '/reports' ? "bg-orange-500" : "bg-white/[0.05]")}>
                <FileText className="w-[15px] h-[15px] text-white" />
              </div>
              {!isCollapsed && <span className="text-[14px] font-semibold">Reports</span>}
            </Link>
          </li>
          <li>
            <Link href="/hiring-timeline" className={cn(
              "flex items-center text-white/60 hover:text-white rounded-[12px] hover:bg-white/[0.07] transition-all duration-200 font-medium text-[14px] tracking-tight",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              pathname === '/hiring-timeline' ? "bg-white/[0.10] text-white" : ""
            )}>
              <div className={cn("rounded-[8px] p-1.5 flex items-center justify-center shrink-0", pathname === '/hiring-timeline' ? "bg-orange-500" : "bg-white/[0.05]")}>
                <History className="w-[15px] h-[15px] text-white" />
              </div>
              {!isCollapsed && <span className="text-[14px] font-semibold">Hiring Timeline</span>}
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Footer Toggle */}
      <div className={cn(
        "border-t border-white/[0.06] p-2.5",
      )}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center text-white/30 hover:text-white/70 transition-all duration-200 rounded-[10px] p-2.5 hover:bg-white/[0.06] w-full",
            isCollapsed ? "justify-center" : "gap-3 px-3"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-[16px] h-[16px]" />
          ) : (
            <PanelLeftClose className="w-[16px] h-[16px]" />
          )}
          {!isCollapsed && <span className="text-[12.5px] font-medium">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
