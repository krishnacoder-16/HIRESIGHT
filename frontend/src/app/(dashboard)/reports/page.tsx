"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { ClosedPositionsTab } from "@/components/reports/ClosedPositionsTab";
import { InternalClosuresTab } from "@/components/reports/InternalClosuresTab";
import { RejectionAnalysisTab } from "@/components/reports/RejectionAnalysisTab";
import { RecruiterPerformanceTab } from "@/components/reports/RecruiterPerformanceTab";

type TabId = 'closed-positions' | 'internal-closures' | 'rejection-analysis' | 'recruiter-performance';

export default function ReportsPage() {
  const { dashboardData } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabId>('closed-positions');
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(new Set(['closed-positions']));
  const [summaryCounts, setSummaryCounts] = useState<{
    closedPositionsCount: number;
    internalClosuresCount: number;
    hasDataset: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiUrl}/reports/summary`);
        if (res.ok) {
          const data = await res.json();
          setSummaryCounts(data);
        }
      } catch (err) {
        console.error("Failed to fetch reports summary counts", err);
      }
    }
    fetchSummary();
  }, [dashboardData]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMountedTabs(prev => new Set(prev).add(tabId));
  };

  const tabs = [
    { id: 'closed-positions', label: 'Closed Positions' },
    { id: 'internal-closures', label: 'Closed by Client / Internal Closure' },
    { id: 'rejection-analysis', label: 'Rejection Analysis' },
    { id: 'recruiter-performance', label: 'Recruiter Performance' }
  ];

  return (
    <div className="space-y-6 font-inter">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-[15px] text-slate-500 mt-1">Operational intelligence and recruitment insights</p>
      </div>

      {dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm flex flex-col">
            <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Closed Positions (Filled by Candidate)</span>
            <span className="text-2xl font-bold text-slate-900">
              {summaryCounts ? summaryCounts.closedPositionsCount : "-"}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm flex flex-col">
            <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Closed by Client / Internal Closure</span>
            <span className="text-2xl font-bold text-slate-900">
              {summaryCounts ? summaryCounts.internalClosuresCount : "-"}
            </span>
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

        {mountedTabs.has('internal-closures') && (
          <div style={{ display: activeTab === 'internal-closures' ? 'block' : 'none' }}>
            <InternalClosuresTab />
          </div>
        )}

        {mountedTabs.has('rejection-analysis') && (
          <div style={{ display: activeTab === 'rejection-analysis' ? 'block' : 'none' }}>
            <RejectionAnalysisTab />
          </div>
        )}

        {mountedTabs.has('recruiter-performance') && (
          <div style={{ display: activeTab === 'recruiter-performance' ? 'block' : 'none' }}>
            <RecruiterPerformanceTab />
          </div>
        )}
      </div>
    </div>
  );
}
