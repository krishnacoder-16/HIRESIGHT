"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileX2 } from "lucide-react";
import { ReportResponse } from "@/types/reports";

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (val: any, row: T) => React.ReactNode;
}

interface ReportTableProps<T> {
  endpoint: string;
  columns: ColumnDef<T>[];
  emptyMessage?: string;
}

export function ReportTable<T>({ endpoint, columns, emptyMessage }: ReportTableProps<T>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (sortBy) {
        params.append("sort_by", sortBy);
        params.append("sort_desc", sortDesc.toString());
      }

      const res = await fetch(`http://localhost:8000/api/reports/${endpoint}?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch report data");
      }

      const json: ReportResponse<T> = await res.json();
      
      // We rely on the backend to tell us if the dataset actually exists
      if (json.meta && json.meta.hasDataset === false) {
        setError("empty_dataset");
      } else {
        setData(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalRecords(json.pagination.totalRecords);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, search, sortBy, sortDesc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (sortBy) {
      params.append("sort_by", sortBy);
      params.append("sort_desc", sortDesc.toString());
    }
    window.open(`http://localhost:8000/api/reports/${endpoint}/export?${params.toString()}`, '_blank');
  };

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      if (sortDesc) {
        setSortBy("");
        setSortDesc(false);
      } else {
        setSortDesc(true);
      }
    } else {
      setSortBy(columnKey);
      setSortDesc(false);
    }
  };

  const renderSortIcon = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return null;
    if (sortBy !== columnKey) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40 hover:opacity-100 transition-opacity" />;
    return sortDesc ? <ArrowDown className="w-4 h-4 ml-1 text-orange-500" /> : <ArrowUp className="w-4 h-4 ml-1 text-orange-500" />;
  };

  if (error === "empty_dataset") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 flex flex-col items-center max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <FileX2 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-inter tracking-tight">Upload Dataset Required</h2>
          <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
            Please upload an Excel tracker from the Dashboard to view this report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-[350px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search report..."
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        
        <button 
          onClick={handleExport}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {columns.map((col) => (
                  <th key={String(col.key)} className="py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
                    {col.sortable ? (
                      <button onClick={() => handleSort(String(col.label))} className="flex items-center hover:text-slate-800 transition-colors group whitespace-nowrap">
                        {col.label} {renderSortIcon(String(col.label), true)}
                      </button>
                    ) : (
                      <span className="whitespace-nowrap">{col.label}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`}>
                    {columns.map((_, colIdx) => (
                      <td key={`skel-col-${colIdx}`} className="py-4 px-6">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-500 text-[15px]">
                    {emptyMessage || "No records found matching your filters."}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="py-4 px-6 text-[14px] text-slate-600 font-medium max-w-[250px] truncate" title={String(row[col.key])}>
                        {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && data.length > 0 && (
          <div className="mt-auto border-t border-slate-100 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] text-slate-500">
              Showing <span className="font-medium text-slate-900">{((page - 1) * pageSize) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(page * pageSize, totalRecords)}</span> of <span className="font-medium text-slate-900">{totalRecords}</span> records
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
