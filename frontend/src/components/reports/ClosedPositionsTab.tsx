"use client";

import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";
import { ClosedPosition } from "@/types/reports";

export function ClosedPositionsTab() {
  const columns: ColumnDef<ClosedPosition>[] = [
    { key: "company", label: "Company", sortable: true, render: (val) => <span className="text-slate-900">{val}</span> },
    { key: "role", label: "Role", sortable: true },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
    { key: "recruiters", label: "Recruiters", render: (val: string[]) => val.join(", ") },
    { key: "totalCvs", label: "Total CVs", sortable: true, render: (val) => <span className="text-slate-900 font-bold">{val}</span> },
    { key: "joinedCandidates", label: "Joined Candidates", sortable: true, render: (val) => <span className="text-emerald-600 font-bold">{val}</span> },
    { key: "closureDate", label: "Closure Date", sortable: true },
  ];

  return <ReportTable<ClosedPosition> endpoint="closed-positions" columns={columns} />;
}
