import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  CheckSquare, 
  Calendar, 
  LineChart, 
  ShoppingBag, 
  ShieldCheck, 
  FileBarChart, 
  Users, 
  BookOpen, 
  History 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  canAccess: (feature: string) => string;
  storesCount: number;
  pendingApprovals: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  canAccess, 
  storesCount,
  pendingApprovals 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gate: 'dashboard' },
    { id: 'stores', label: `Toko (${storesCount})`, icon: Store, gate: 'stores' },
    { id: 'tasks', label: 'Manajemen Tugas', icon: CheckSquare, gate: 'tasks' },
    { id: 'campaigns', label: 'Campaign Planner', icon: Calendar, gate: 'campaigns' },
    { id: 'ads', label: 'Ads Tracker', icon: LineChart, gate: 'ads', badge: 'ROAS' },
    { id: 'products', label: 'Optimasi Produk', icon: ShoppingBag, gate: 'products' },
    { id: 'approvals', label: 'Persetujuan', icon: ShieldCheck, gate: 'approvals', countKey: 'pendingApprovals' },
    { id: 'reports', label: 'Reports Generator', icon: FileBarChart, gate: 'reports' },
    { id: 'team', label: 'Tim & Beban Kerja', icon: Users, gate: 'team' },
    { id: 'sops', label: 'Perpustakaan SOP', icon: BookOpen, gate: 'sop' },
    { id: 'logs', label: 'Log Aktivitas', icon: History, gate: 'logs' },
  ];

  return (
    <aside className="w-64 bg-[#1E3A8A] text-white flex flex-col justify-between shrink-0 shadow-lg select-none">
      <div>
        {/* Brand Banner */}
        <div className="p-5 border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 p-1.5 rounded-lg text-white font-bold text-lg leading-none">M</span>
            <div>
              <span className="font-bold text-lg tracking-wide block leading-none">MarketOps</span>
              <span className="text-[9px] text-blue-300 font-medium tracking-wider font-mono">WORKSPACE</span>
            </div>
          </div>
          <span className="text-[9px] bg-red-600 px-1.5 py-0.5 rounded text-white font-mono uppercase font-bold tracking-tight">CONFIDENTIAL</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const permission = canAccess(item.gate);
            if (permission === 'None') return null;

            const IconComp = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-blue-800 text-white shadow-inner border-l-4 border-blue-400 pl-2.5' 
                    : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComp className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                
                {/* Specific Badges or Counter indicators */}
                {item.badge && (
                  <span className="bg-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded text-white font-mono scale-90">
                    {item.badge}
                  </span>
                )}
                {item.countKey === 'pendingApprovals' && pendingApprovals > 0 && (
                  <span className="bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingApprovals}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Corporate Metadata Footer */}
      <div className="p-4 border-t border-blue-900 bg-[#111827]/30 text-xs text-blue-200 space-y-1 text-center font-mono">
        <p className="font-bold text-white font-sans text-[13px]">MarketOps Pro v1.4</p>
        <p className="text-[10px]">Target Periode: Mei 2026</p>
        <div className="flex justify-center items-center space-x-1.5 text-[9px] text-gray-400 mt-1">
          <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Active Session DB</span>
        </div>
      </div>
    </aside>
  );
}
