"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

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
