"use client";

import { useState } from "react";
import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";

type TimelineType = "daily" | "weekly" | "monthly";

interface RecruiterPerformanceCandidate {
  recruiterName: string;
  totalCvSent: number;
  joinedCandidates: number;
}

export function RecruiterPerformanceTab() {
  const [timelineType, setTimelineType] = useState<TimelineType>("daily");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleTimelineTypeChange = (type: TimelineType) => {
    setTimelineType(type);
    // Reset filters on switch
    setSelectedDate("");
    setSelectedWeek("");
    setSelectedMonth("");
  };

  const getSummaryHeader = () => {
    let timeLabel = "";
    if (timelineType === "daily" && selectedDate) {
      timeLabel = new Date(selectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } else if (timelineType === "weekly" && selectedWeek) {
      timeLabel = `Week ${selectedWeek.split("-W")[1]} ${selectedWeek.split("-W")[0]}`;
    } else if (timelineType === "monthly" && selectedMonth) {
      timeLabel = new Date(selectedMonth + "-01").toLocaleString("default", { month: "long", year: "numeric" });
    }

    if (!timeLabel) return "";
    
    return `${timelineType.charAt(0).toUpperCase() + timelineType.slice(1)} Recruiter Performance — ${timeLabel}`;
  };

  const summaryHeader = getSummaryHeader();

  const columns: ColumnDef<RecruiterPerformanceCandidate>[] = [
    { key: "recruiterName", label: "Recruiter Name", sortable: true, render: (val) => <span className="text-slate-900 font-medium">{val}</span> },
    { key: "totalCvSent", label: "Total CVs Sent", sortable: true, render: (val) => <span className="text-slate-600 font-medium">{val}</span> },
    { key: "joinedCandidates", label: "Joined Candidates", sortable: true, render: (val) => <span className="text-emerald-600 font-medium">{val}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recruiter Performance</h2>
          <p className="text-[14px] text-slate-500 mt-1">Track daily, weekly, and monthly submissions</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/70 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleTimelineTypeChange("daily")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                timelineType === "daily" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Daily
            </button>
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

          {timelineType === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border-none bg-slate-50 text-[14px] font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer"
            />
          )}
          {timelineType === "weekly" && (
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-1.5 border-none bg-slate-50 text-[14px] font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer"
            />
          )}
          {timelineType === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border-none bg-slate-50 text-[14px] font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer"
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <ReportTable<RecruiterPerformanceCandidate>
          key={`recruiter-performance-${timelineType}-${selectedDate}-${selectedMonth}-${selectedWeek}`}
          endpoint="recruiter-performance"
          columns={columns}
          timelineType={timelineType}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedWeek={selectedWeek}
          summaryHeader={summaryHeader}
          emptyMessage="No recruiter activity found."
        />
      </div>
    </div>
  );
}
