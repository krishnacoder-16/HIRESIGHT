"use client";

import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";
import { OfferRollout } from "@/types/reports";

export function OfferRolloutTab() {
  const columns: ColumnDef<OfferRollout>[] = [
    { key: "candidateName", label: "Candidate Name", sortable: true, render: (val) => <span className="text-slate-900 font-medium">{val}</span> },
    { key: "company", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
    { key: "recruiter", label: "Recruiter", sortable: true },
    { key: "offerStatus", label: "Offer Status", sortable: true, render: (val) => <span className="text-blue-600 font-medium">{val}</span> },
    { key: "joiningStatus", label: "Joining Status", sortable: true, render: (val) => <span className="text-orange-500 font-medium">{val}</span> },
  ];

  return <ReportTable<OfferRollout> endpoint="offer-rollout" columns={columns} emptyMessage="No offer rollout candidates found" />;
}
