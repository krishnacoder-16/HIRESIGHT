"use client";

import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";
import { JoinedCandidate } from "@/types/reports";

export function JoinedCandidatesTab() {
  const columns: ColumnDef<JoinedCandidate>[] = [
    { key: "candidateName", label: "Candidate Name", sortable: true, render: (val) => <span className="text-slate-900 font-medium">{val}</span> },
    { key: "company", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
    { key: "recruiter", label: "Recruiter", sortable: true },
    { key: "joiningDate", label: "Joining Date", sortable: true, render: (val) => <span className="text-emerald-600 font-medium">{val}</span> },
  ];

  return <ReportTable<JoinedCandidate> endpoint="joined-candidates" columns={columns} />;
}
