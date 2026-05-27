"use client";

import React, { useState } from 'react';
import { useSettings, ThemeMode, LandingPage } from '@/contexts/SettingsContext';
import { useToast } from '@/contexts/ToastContext';
import { Monitor, Moon, Sun, Layout, Database, Trash2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

export default function SettingsPage() {
  const { themeMode, compactTables, defaultRowsPerPage, defaultLandingPage, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();
  const { setDashboardData } = useDashboard();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDataset = async () => {
    setIsClearing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/dataset`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to clear dataset');
      }
      
      setDashboardData(null);
      toast('Dataset cleared successfully', 'success');
    } catch (err) {
      toast('Failed to clear dataset', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const handleReset = () => {
    resetSettings();
    toast('Preferences reset successfully', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-[14px] text-slate-500 mt-1">Manage your application preferences and workspace settings.</p>
      </div>

      <div className="space-y-8">
        {/* Appearance Section */}
        <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[15px] font-semibold text-slate-900">Appearance</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Customize the visual style of your workspace.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-3">Theme Mode</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { updateSettings({ themeMode: 'light' }); toast('Preferences saved', 'success'); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    themeMode === 'light' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Sun className={`w-5 h-5 mb-2 ${themeMode === 'light' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span className={`text-[13px] font-medium ${themeMode === 'light' ? 'text-orange-700' : 'text-slate-600'}`}>Light</span>
                </button>
                <button
                  onClick={() => { updateSettings({ themeMode: 'dark' }); toast('Preferences saved', 'success'); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    themeMode === 'dark' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Moon className={`w-5 h-5 mb-2 ${themeMode === 'dark' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span className={`text-[13px] font-medium ${themeMode === 'dark' ? 'text-orange-700' : 'text-slate-600'}`}>Dark</span>
                </button>
                <button
                  onClick={() => { updateSettings({ themeMode: 'system' }); toast('Preferences saved', 'success'); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    themeMode === 'system' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Monitor className={`w-5 h-5 mb-2 ${themeMode === 'system' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span className={`text-[13px] font-medium ${themeMode === 'system' ? 'text-orange-700' : 'text-slate-600'}`}>System</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="block text-[13px] font-medium text-slate-700 mb-0.5">Compact Tables</span>
                  <span className="block text-[12px] text-slate-500">Reduce row height to fit more data on screen.</span>
                </div>
                <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none shrink-0" 
                     onClick={() => { updateSettings({ compactTables: !compactTables }); toast('Preferences saved', 'success'); }}>
                  <div className={`absolute inset-0 rounded-full transition-colors ${compactTables ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${compactTables ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Dashboard Preferences Section */}
        <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-slate-500" />
              <h2 className="text-[15px] font-semibold text-slate-900">Dashboard Preferences</h2>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5">Manage default behaviors for analytical views.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-2">Default Rows Per Page</label>
              <select 
                value={defaultRowsPerPage}
                onChange={(e) => { updateSettings({ defaultRowsPerPage: Number(e.target.value) }); toast('Preferences saved', 'success'); }}
                className="w-full max-w-[240px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value={25}>25 Rows</option>
                <option value={50}>50 Rows</option>
                <option value={100}>100 Rows</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-2">Default Landing Page</label>
              <select 
                value={defaultLandingPage}
                onChange={(e) => { updateSettings({ defaultLandingPage: e.target.value as LandingPage }); toast('Preferences saved', 'success'); }}
                className="w-full max-w-[240px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="dashboard">Dashboard</option>
                <option value="candidate-pipeline">Candidate Pipeline</option>
                <option value="jobs">Jobs</option>
                <option value="reports">Reports</option>
                <option value="hiring-timeline">Hiring Timeline</option>
              </select>
            </div>
          </div>
        </section>

        {/* Application Section */}
        <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <h2 className="text-[15px] font-semibold text-slate-900">Application</h2>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5">Manage global application state and versions.</p>
          </div>
          
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="block text-[13px] font-semibold text-slate-900">Clear Uploaded Dataset</span>
                <span className="block text-[12px] text-slate-500 mt-0.5">Erase the current in-memory analytics dataset. This cannot be undone.</span>
              </div>
              <button
                onClick={handleClearDataset}
                disabled={isClearing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50"
              >
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Clear Dataset
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="block text-[13px] font-semibold text-slate-900">Reset Preferences</span>
                <span className="block text-[12px] text-slate-500 mt-0.5">Restore all settings to their original factory defaults.</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 rounded-lg text-[13px] font-semibold transition-all"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Reset Defaults
              </button>
            </div>

            <div className="mt-2 flex items-center justify-center opacity-60">
              <span className="text-[11px] font-medium text-slate-400 tracking-wider">HIRESIGHT v1.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
