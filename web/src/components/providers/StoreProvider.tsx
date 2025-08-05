'use client';

import { ReactNode } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define store types
interface AppState {
  sidebarOpen: boolean;
  notifications: any[];
  theme: 'light' | 'dark' | 'system';
  language: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
}

// Create store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: false,
        notifications: [],
        theme: 'system',
        language: 'en',
        
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        
        addNotification: (notification) => 
          set((state) => ({ 
            notifications: [...state.notifications, { ...notification, id: Date.now().toString() }] 
          })),
        
        removeNotification: (id) => 
          set((state) => ({ 
            notifications: state.notifications.filter(n => n.id !== id) 
          })),
        
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
      }),
      {
        name: 'kp5-academy-store',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    {
      name: 'kp5-academy-store',
    }
  )
);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return <>{children}</>;
} 