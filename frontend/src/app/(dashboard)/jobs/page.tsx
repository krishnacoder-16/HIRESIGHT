"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileX2, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { JobResponse, Job } from "@/types/jobs";
import { useSettings } from "@/contexts/SettingsContext";

export default function JobsPipeline() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "";

  const [data, setData] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filter options
  const [recruiterOptions, setRecruiterOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);

  // Query state
  const { defaultRowsPerPage, isLoaded, compactTables } = useSettings();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultRowsPerPage);
  const [hasInitSize, setHasInitSize] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasInitSize) {
      setPageSize(defaultRowsPerPage);
      setHasInitSize(true);
    }
  }, [isLoaded, defaultRowsPerPage, hasInitSize]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); 
  const [recruiter, setRecruiter] = useState("");
  const [company, setCompany] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (recruiter) params.append("recruiter", recruiter);
      if (company) params.append("company", company);
      if (sortBy) {
        params.append("sort_by", sortBy);
        params.append("sort_desc", sortDesc.toString());
      }
      if (statusParam) params.append("status", statusParam);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/jobs/?${params.toString()}`);
      
      if (res.status === 404) {
        setError("No dataset uploaded yet.");
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const json: JobResponse = await res.json();
      setData(json.data);
      setTotalPages(json.pagination.totalPages);
      setTotalRecords(json.pagination.totalRecords);
      setRecruiterOptions(json.filters.recruiters);
      setCompanyOptions(json.filters.companies);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, recruiter, company, sortBy, sortDesc, statusParam]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (recruiter) params.append("recruiter", recruiter);
    if (company) params.append("company", company);
    if (sortBy) {
      params.append("sort_by", sortBy);
      params.append("sort_desc", sortDesc.toString());
    }
    if (statusParam) params.append("status", statusParam);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    window.open(`${apiUrl}/jobs/export?${params.toString()}`, '_blank');
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sortDesc) {
        setSortBy("");
        setSortDesc(false);
      } else {
        setSortDesc(true);
      }
    } else {
      setSortBy(column);
      setSortDesc(false);
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40 hover:opacity-100 transition-opacity" />;
    return sortDesc ? <ArrowDown className="w-4 h-4 ml-1 text-orange-500" /> : <ArrowUp className="w-4 h-4 ml-1 text-orange-500" />;
  };



  if (error === "No dataset uploaded yet.") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 flex flex-col items-center max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <FileX2 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-inter tracking-tight">Upload Dataset Required</h2>
          <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
            Please upload an Excel tracker from the Dashboard to view the jobs pipeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs Pipeline</h1>
          <p className="text-[15px] text-slate-500 mt-1">Manage derived recruitment positions and aggregated metrics</p>
        </div>
        
        <button 
          onClick={handleExport}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 flex flex-col lg:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by company, role, recruiter, SPOC..."
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={company}
            onChange={(e) => { setCompany(e.target.value); setPage(1); }}
            className="block w-full sm:w-[180px] px-3 py-2.5 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white cursor-pointer"
          >
            <option value="">All Companies</option>
            {companyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <select
            value={recruiter}
            onChange={(e) => { setRecruiter(e.target.value); setPage(1); }}
            className="block w-full sm:w-[180px] px-3 py-2.5 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white cursor-pointer"
          >
            <option value="">All Recruiters</option>
            {recruiterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>


        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>
                  <button onClick={() => handleSort("Company")} className="flex items-center hover:text-slate-800 transition-colors group">
                    Company {renderSortIcon("Company")}
                  </button>
                </th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>
                  <button onClick={() => handleSort("Role")} className="flex items-center hover:text-slate-800 transition-colors group">
                    Role {renderSortIcon("Role")}
                  </button>
                </th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>Company SPOC</th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>Recruiters</th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>
                  <button onClick={() => handleSort("Total CVs")} className="flex items-center hover:text-slate-800 transition-colors group">
                    Total CVs {renderSortIcon("Total CVs")}
                  </button>
                </th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>
                  <button onClick={() => handleSort("Active Candidates")} className="flex items-center hover:text-slate-800 transition-colors group">
                    Active {renderSortIcon("Active Candidates")}
                  </button>
                </th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>Rejected</th>
                <th className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider`}>
                  <button onClick={() => handleSort("Joined")} className="flex items-center hover:text-slate-800 transition-colors group">
                    Joined {renderSortIcon("Joined")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`}>
                    {Array.from({ length: 8 }).map((_, colIdx) => (
                      <td key={`skel-col-${colIdx}`} className={`${compactTables ? 'py-3' : 'py-4'} px-6`}>
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-[15px]">
                    No jobs found matching your filters.
                  </td>
                </tr>
              ) : (
                data.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] font-medium text-slate-900`}>{job.company}</td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-slate-600 font-medium max-w-[200px] truncate`} title={job.role}>{job.role}</td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-slate-600`}>{job.companySpoc}</td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-slate-600`}>
                      <div className="max-w-[200px] truncate" title={job.recruiters.join(", ")}>
                        {job.recruiters.join(", ")}
                      </div>
                    </td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-slate-900 font-bold`}>{job.totalCvs}</td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-blue-600 font-bold`}>{job.activeCandidates}</td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-red-500 font-bold`}>{job.rejected}</td>
                    <td className={`${compactTables ? 'py-3' : 'py-4'} px-6 text-[14px] text-emerald-600 font-bold`}>{job.joined}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && data.length > 0 && (
          <div className="mt-auto border-t border-slate-100 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] text-slate-500">
              Showing <span className="font-medium text-slate-900">{((page - 1) * pageSize) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(page * pageSize, totalRecords)}</span> of <span className="font-medium text-slate-900">{totalRecords}</span> jobs
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-500 font-medium">Rows per page</span>
                <select 
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border-none bg-slate-50 text-[13px] font-medium text-slate-700 py-1.5 px-2 rounded-md focus:ring-0 cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[13px] font-medium text-slate-700 min-w-[3rem] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
