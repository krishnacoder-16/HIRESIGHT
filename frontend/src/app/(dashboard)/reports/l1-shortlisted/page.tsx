"use client";

import { ReportTable, ColumnDef } from "@/components/ui/ReportTable";

interface ShortlistedCandidate {
  candidateName: string;
  phoneNumber: string;
  emailId: string;
  recruiter: string;
  companyName: string;
  role: string;
  companySpoc: string;
}

export default function L1ShortlistedPage() {
  const columns: ColumnDef<ShortlistedCandidate>[] = [
    { key: "candidateName", label: "Candidate Name", sortable: true, render: (val) => <span className="text-slate-900 font-medium">{val}</span> },
    { key: "companyName", label: "Company Name", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "recruiter", label: "Recruiter", sortable: true },
    { key: "phoneNumber", label: "Phone Number", sortable: false },
    { key: "emailId", label: "Email ID", sortable: false },
    { key: "companySpoc", label: "Company SPOC", sortable: true },
  ];

  return (
    <div className="space-y-6 font-inter">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">L1 Shortlisted</h1>
        <p className="text-[15px] text-slate-500 mt-1">Candidates who have successfully cleared the L1 interview stage</p>
      </div>

      <div className="mt-6">
        <ReportTable<ShortlistedCandidate> 
          endpoint="l1-shortlisted" 
          columns={columns} 
          emptyMessage="No candidates found matching the L1 shortlisted criteria."
        />
      </div>
    </div>
  );
}
