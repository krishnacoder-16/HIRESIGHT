"use client";

import { useRef, ChangeEvent } from 'react';
import { UserCircle, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useDashboard } from '@/contexts/DashboardContext';

export function Navbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setDashboardData, isLoading, setIsLoading } = useDashboard();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast('Invalid file type. Please upload an .xlsx or .xls file.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process file');
      }

      setDashboardData(data);
      toast('Dataset uploaded and processed successfully!', 'success');
    } catch (error: any) {
      toast(error.message || 'An error occurred during upload', 'error');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="h-[68px] bg-white/60 backdrop-blur-sm border-b border-slate-200/50 flex items-center justify-between px-8 z-10 relative shrink-0">
      <div>
        <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">Recruitment Analytics</h1>
        <p className="text-[13px] text-slate-500 font-medium mt-0.5">
          Real-time pipeline intelligence — messy data, <span className="text-orange-600 font-semibold">clean insights</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx, .xls" 
          className="hidden" 
        />
        <button 
          onClick={handleUploadClick}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-semibold text-[13px] tracking-tight shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-orange-500 group-hover:-translate-y-0.5 transition-transform" />
          )}
          {isLoading ? 'Processing...' : 'Upload Different Dataset'}
        </button>
        <div className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-900 transition-colors px-1.5 py-1 rounded-full hover:bg-black/5">
          <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center shadow-sm">
            <span className="text-orange-600 font-bold text-[13px]">N</span>
          </div>
        </div>
      </div>
    </header>
  );
}
