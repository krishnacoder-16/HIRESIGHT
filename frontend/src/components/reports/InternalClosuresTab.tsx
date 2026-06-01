"use client";

import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";
import { InternalClosure } from "@/types/reports";

export function InternalClosuresTab() {
  const columns: ColumnDef<InternalClosure>[] = [
    { key: "company", label: "Company", sortable: true, render: (val) => <span className="text-slate-900">{val}</span> },
    { key: "role", label: "Role", sortable: true },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
    { key: "recruiters", label: "Recruiters", render: (val: string[]) => val.join(", ") },
    { key: "totalCvs", label: "Total CVs", sortable: true, render: (val) => <span className="text-slate-900 font-bold">{val}</span> },
    { key: "closureReason", label: "Closure Reason", sortable: true, render: (val) => <span className="text-amber-600 font-bold">{val}</span> },
  ];

  return <ReportTable<InternalClosure> endpoint="internal-closures" columns={columns} />;
}
