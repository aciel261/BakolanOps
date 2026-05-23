import React, { useMemo, useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Activity, 
  Mail, 
  Award, 
  Gauge, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { User as AppUser, Task } from '../types';

interface TeamTabProps {
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  tasks: Task[];
  currentUser?: AppUser | null;
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
}

export default function TeamTab({
  users,
  setUsers,
  tasks,
  currentUser,
  onLogActivity
}: TeamTabProps) {

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Calculate dynamic workload and completion metrics per user
  const userPerformance = useMemo(() => {
    return users.map((user) => {
      const userTasks = tasks.filter(t => t.assignedTo === user.id);
      const totalAssigned = userTasks.length;
      const completedCount = userTasks.filter(t => t.status === 'Done').length;
      const activeCount = userTasks.filter(t => t.status !== 'Done').length;
      
      const completionRate = totalAssigned > 0 
        ? Math.round((completedCount / totalAssigned) * 100) 
        : 100; // default 100% if no tasks assigned yet

      return {
        ...user,
        totalAssigned,
        completedCount,
        activeCount,
        completionRate
      };
    });
  }, [users, tasks]);

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tim & Beban Kerja (Team Workload)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau produktivitas harian tim marketplace, audit rasio penyelesaian tugas (SLA), dan periksa pembagian beban kerja merata.
        </p>
      </div>

      {/* METRIC SUMMARY COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none font-medium">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Personel Terdaftar</span>
            <p className="text-xl font-extrabold text-blue-950 mt-1">{users.length} Spesialis</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Activity className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Staf Aktif Bekerja (Roster)</span>
            <p className="text-xl font-extrabold text-green-950 mt-1">
              {users.filter(u => u.active).length} Personel
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Gauge className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Target SLA Rata-rata</span>
            <p className="text-xl font-extrabold text-indigo-950 mt-1">94% Kepatuhan</p>
          </div>
        </div>

      </div>

      {/* ROSTER TEAM LIST PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {userPerformance.map((u) => {
          let progressBg = 'bg-blue-600';
          if (u.completionRate < 60) progressBg = 'bg-red-600';
          else if (u.completionRate < 85) progressBg = 'bg-amber-500';

          return (
            <div 
              key={u.id} 
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              
              <div className="space-y-4">
                {/* Profile row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 bg-blue-100 border-2 border-blue-200 text-[#1E3A8A] font-extrabold rounded-full flex items-center justify-center text-sm uppercase shadow-sm">
                      {u.avatar}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-800 text-sm tracking-tight">{u.name}</h3>
                      <p className="text-[10px] text-gray-400 font-mono font-semibold tracking-tight uppercase">{u.role}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.active ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Email details */}
                <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-semibold border-b border-gray-50 pb-3">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{u.email}</span>
                </div>

                {/* Task Stats representation */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1 text-center font-medium">
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-50">
                    <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Beban Tugas</span>
                    <strong className="text-gray-700 font-extrabold text-sm block mt-0.5">
                      {u.activeCount} <span className="text-[10px] font-normal font-sans text-gray-400">aktif</span>
                    </strong>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-50">
                    <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Done (Tuntas)</span>
                    <strong className="text-green-700 font-extrabold text-sm block mt-0.5">
                      {u.completedCount} <span className="text-[10px] font-normal font-sans text-gray-400">tuntas</span>
                    </strong>
                  </div>
                </div>

              </div>

              {/* Progress SLA checklist bar */}
              <div className="space-y-1.5 border-t border-gray-50 pt-4">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono font-bold">
                  <span>Rasio Penyelesaian Kerja</span>
                  <span className="text-gray-600 font-extrabold font-mono">{u.completionRate}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${progressBg}`}
                    style={{ width: `${u.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Secure delete controls only for Lead Marketplace */}
              {confirmDeleteId === u.id ? (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-50 bg-red-50/50 p-3 rounded-xl animate-fade-in">
                  <span className="text-[10px] text-red-700 font-extrabold uppercase">Hapus Anggota?</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setUsers(prev => prev.filter(user => user.id !== u.id));
                        onLogActivity('Auth', 'Hapus Akun Pengguna', `Menghapus akun pengguna "${u.name}" (ID: ${u.id}) dari tim.`);
                        setConfirmDeleteId(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg transition"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                currentUser?.id !== u.id && (
                  <div className="flex justify-end mt-2 pt-2">
                    <button
                      onClick={() => setConfirmDeleteId(u.id)}
                      className="text-[9px] text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 font-bold uppercase px-2.5 py-1 rounded-lg border border-red-200 transition flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Akun</span>
                    </button>
                  </div>
                )
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
