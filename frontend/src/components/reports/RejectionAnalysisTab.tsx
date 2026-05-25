"use client";

import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";
import { RejectionAnalysis } from "@/types/reports";

export function RejectionAnalysisTab() {
  const columns: ColumnDef<RejectionAnalysis>[] = [
    { key: "company", label: "Company", sortable: true, render: (val) => <span className="text-slate-900">{val}</span> },
    { key: "role", label: "Role", sortable: true },
    { key: "recruiter", label: "Recruiter", render: (val: string[]) => val.join(", ") },
    { key: "rejected", label: "Rejected", sortable: true },
    { key: "dropped", label: "Dropped", sortable: true },
    { key: "noResponse", label: "No Response", sortable: true },
    { key: "notInterested", label: "Not Interested", sortable: true },
    { key: "totalFailed", label: "Total Failed", sortable: true, render: (val) => <span className="text-red-500 font-bold">{val}</span> },
    { key: "rejectionPercentage", label: "Rejection %", sortable: true, render: (val) => <span className="text-orange-500 font-bold">{val}</span> },
  ];

  return <ReportTable<RejectionAnalysis> endpoint="rejection-analysis" columns={columns} />;
}
