"use client";

import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { ClosedPositionsTab } from "@/components/reports/ClosedPositionsTab";
import { RejectionAnalysisTab } from "@/components/reports/RejectionAnalysisTab";

type TabId = 'closed-positions' | 'rejection-analysis';

export default function ReportsPage() {
  const { dashboardData } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabId>('closed-positions');
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(new Set(['closed-positions']));

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMountedTabs(prev => new Set(prev).add(tabId));
  };

  const tabs = [
    { id: 'closed-positions', label: 'Closed Positions' },
    { id: 'rejection-analysis', label: 'Rejection Analysis' }
  ];

  return (
    <div className="space-y-6 font-inter">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-[15px] text-slate-500 mt-1">Operational intelligence and recruitment insights</p>
      </div>

      {dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm flex flex-col">
            <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Closed Positions</span>
            <span className="text-2xl font-bold text-slate-900">{dashboardData.kpis.positionsClosed}</span>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200/70 flex overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as TabId)}
            className={`whitespace-nowrap px-6 py-4 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {mountedTabs.has('closed-positions') && (
          <div style={{ display: activeTab === 'closed-positions' ? 'block' : 'none' }}>
            <ClosedPositionsTab />
          </div>
        )}

        {mountedTabs.has('rejection-analysis') && (
          <div style={{ display: activeTab === 'rejection-analysis' ? 'block' : 'none' }}>
            <RejectionAnalysisTab />
          </div>
        )}
      </div>
    </div>
  );
}
