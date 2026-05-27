"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type LandingPage = 'dashboard' | 'jobs' | 'reports' | 'hiring-timeline' | 'candidate-pipeline';

interface SettingsState {
  themeMode: ThemeMode;
  compactTables: boolean;
  defaultRowsPerPage: number;
  defaultLandingPage: LandingPage;
}

const DEFAULT_SETTINGS: SettingsState = {
  themeMode: 'system',
  compactTables: false,
  defaultRowsPerPage: 25,
  defaultLandingPage: 'dashboard',
};

interface SettingsContextType extends SettingsState {
  updateSettings: (updates: Partial<SettingsState>) => void;
  resetSettings: () => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hiresight_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage, using defaults.');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      try {
        localStorage.setItem('hiresight_settings', JSON.stringify(newSettings));
      } catch (e) {
        console.warn('Failed to save settings to localStorage.');
      }
      return newSettings;
    });
  };

  const resetSettings = () => {
    try {
      localStorage.removeItem('hiresight_settings');
    } catch (e) {
      console.warn('Failed to clear settings from localStorage.');
    }
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, resetSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
