import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Terminal, 
  Clipboard,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsTabProps {
  logs: ActivityLog[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function ActivityLogsTab({
  logs,
  setLogs
}: ActivityLogsTabProps) {
  
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchType = filterType === 'All' || log.entityType === filterType;
      const matchSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.changedBy.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [logs, filterType, searchQuery]);

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Log Aktivitas Sistem (Activity Logs)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Riwayat modifikasi data yang terekam secara real-time. Melacak PIC, tanggal mutasi state, dan detail tindakan secara transparan.
          </p>
        </div>

        <button
          onClick={() => setLogs([])}
          className="p-2 py-2 px-4 rounded-xl text-xs font-bold font-sans border border-red-200 text-red-600 hover:bg-red-50 flex items-center space-x-1.5 transition shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus Seluruh Riwayat Log</span>
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        
        <div className="relative w-full md:w-85 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama pelaku, tipe, atau detail aksi..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 pl-10 focus:ring-1 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono shrink-0">Entitas:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg p-2 px-3 outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">Semua Kejadian</option>
            <option value="Store">Toko (Stores)</option>
            <option value="Task">Penugasan (Tasks)</option>
            <option value="Campaign">Kampanye (Campaigns)</option>
            <option value="Ads">Iklan (Ads)</option>
            <option value="Product">Katalog (Products)</option>
            <option value="Auth">Simulaltor (Auth)</option>
            <option value="System">Operasional Sistem</option>
          </select>
        </div>

      </div>

      {/* RIWAYAT LOG TIMELINE GRID */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 font-mono">
              <th className="p-4 pl-6">Tanggal & Waktu</th>
              <th className="p-4">Tipe Entitas</th>
              <th className="p-4">Tindakan Resmi</th>
              <th className="p-4">Detail Mutasi Riwayat</th>
              <th className="p-4 pr-6 text-right">Pelaku PIC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-medium">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">Belum ada riwayat aktivitas termodifikasi saat sekarang.</td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                let entColor = 'bg-gray-100 text-gray-700';
                if (log.entityType === 'Store') entColor = 'bg-blue-100 text-[#1E3A8A] border-blue-50';
                if (log.entityType === 'Task') entColor = 'bg-amber-100 text-amber-900 border-amber-50';
                if (log.entityType === 'Campaign') entColor = 'bg-indigo-100 text-indigo-950 border-[#1E3A8A]/10';
                if (log.entityType === 'Ads') entColor = 'bg-green-100 text-green-900 border-green-50';
                if (log.entityType === 'Product') entColor = 'bg-purple-100 text-purple-900';

                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-gray-400 font-mono font-bold">{log.timestamp}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${entColor}`}>
                        {log.entityType}
                      </span>
                    </td>
                    <td className="p-4 text-gray-800 font-bold">{log.action}</td>
                    <td className="p-4 text-gray-500 italic">"{log.details}"</td>
                    <td className="p-4 pr-6 text-right text-gray-700 font-semibold">{log.changedBy}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
