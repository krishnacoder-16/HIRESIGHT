"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DashboardData } from '@/types/analytics';

interface DashboardContextType {
  dashboardData: DashboardData | null;
  setDashboardData: (data: DashboardData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    async function rehydrateState() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiUrl}/analytics`);
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to rehydrate dashboard state", err);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    }
    
    rehydrateState();
  }, []);

  if (!hasInitialized) {
    // Return null to prevent layout flashing while checking if backend has data
    return null;
  }

  return (
    <DashboardContext.Provider value={{ dashboardData, setDashboardData, isLoading, setIsLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
