"use client";

import { useState } from "react";
import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";

type TimelineType = "weekly" | "monthly";
type TabId = "joined" | "offered";

interface TimelineCandidate {
  candidateName: string;
  companyName: string;
  role: string;
  companySpoc: string;
  recruiter: string[];
  joiningDate?: string;
  offerStatus?: string;
  date?: string;
}

export default function HiringTimelinePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const [timelineType, setTimelineType] = useState<TimelineType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("joined");
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(new Set(["joined"]));

  const handleTimelineTypeChange = (type: TimelineType) => {
    setTimelineType(type);
    // Reset filters on switch as per UX requirements
    setSelectedMonth("");
    setSelectedWeek("");
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMountedTabs(prev => new Set(prev).add(tabId));
  };

  // Generate lightweight summary headers
  const getSummaryHeader = () => {
    const timeLabel = timelineType === "monthly" && selectedMonth
      ? new Date(selectedMonth + "-01").toLocaleString("default", { month: "long", year: "numeric" })
      : timelineType === "weekly" && selectedWeek
      ? `Week ${selectedWeek.split("-W")[1]} ${selectedWeek.split("-W")[0]}`
      : "";
    
    if (!timeLabel) return "";

    const entityLabel = activeTab === "joined" ? "Joined Candidates" : "Offered Candidates";
    return `Showing ${entityLabel} — ${timeLabel}`;
  };

  const summaryHeader = getSummaryHeader();

  const joinedColumns: ColumnDef<TimelineCandidate>[] = [
    { key: "candidateName", label: "Candidate Name", sortable: true, render: (val) => <span className="text-slate-900 font-medium">{val}</span> },
    { key: "companyName", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
    { key: "recruiter", label: "Recruiter", render: (val: string[]) => val.join(", ") },
    { key: "joiningDate", label: "Joining Date", sortable: true, render: (val) => <span className="text-emerald-600 font-medium">{val}</span> },
  ];

  const offeredColumns: ColumnDef<TimelineCandidate>[] = [
    { key: "candidateName", label: "Candidate Name", sortable: true, render: (val) => <span className="text-slate-900 font-medium">{val}</span> },
    { key: "companyName", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
    { key: "recruiter", label: "Recruiter", render: (val: string[]) => val.join(", ") },
    { key: "offerStatus", label: "Offer Status", sortable: true, render: (val) => <span className="text-blue-600 font-medium">{val}</span> },
    { key: "date", label: "Date", sortable: true },
  ];

  return (
    <div className="space-y-6 font-inter">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hiring Timeline</h1>
          <p className="text-[15px] text-slate-500 mt-1">Historical time-based recruitment tracking</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/70 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleTimelineTypeChange("weekly")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                timelineType === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleTimelineTypeChange("monthly")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                timelineType === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="w-[1px] h-6 bg-slate-200"></div>

          {timelineType === "monthly" ? (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border-none bg-slate-50 text-[14px] font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer"
            />
          ) : (
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-1.5 border-none bg-slate-50 text-[14px] font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200/70 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => handleTabChange("joined")}
          className={`whitespace-nowrap px-6 py-4 text-[14px] font-medium border-b-2 transition-colors ${
            activeTab === "joined"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Joined Candidates
        </button>
        <button
          onClick={() => handleTabChange("offered")}
          className={`whitespace-nowrap px-6 py-4 text-[14px] font-medium border-b-2 transition-colors ${
            activeTab === "offered"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Offered Candidates
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {mountedTabs.has("joined") && (
          <div style={{ display: activeTab === "joined" ? "block" : "none" }}>
            <ReportTable<TimelineCandidate>
              key={`joined-${timelineType}-${selectedMonth}-${selectedWeek}`}
              endpoint="joined"
              apiEndpoint={`${apiUrl}/timeline`}
              columns={joinedColumns}
              timelineType={timelineType}
              selectedMonth={selectedMonth}
              selectedWeek={selectedWeek}
              summaryHeader={summaryHeader}
              emptyMessage="No joined candidates found for the selected timeline."
            />
          </div>
        )}

        {mountedTabs.has("offered") && (
          <div style={{ display: activeTab === "offered" ? "block" : "none" }}>
            <ReportTable<TimelineCandidate>
              key={`offered-${timelineType}-${selectedMonth}-${selectedWeek}`}
              endpoint="offered"
              apiEndpoint={`${apiUrl}/timeline`}
              columns={offeredColumns}
              timelineType={timelineType}
              selectedMonth={selectedMonth}
              selectedWeek={selectedWeek}
              summaryHeader={summaryHeader}
              emptyMessage="No offered candidates found for the selected timeline."
            />
          </div>
        )}
      </div>
    </div>
  );
}
