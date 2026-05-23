import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  MessageCircle,
  Clock,
  Send,
  User,
  Sparkles
} from 'lucide-react';
import { Task, Store, User as AppUser } from '../types';

interface ApprovalsTabProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  stores: Store[];
  users: AppUser[];
  currentUserRole: string;
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ApprovalsTab({
  tasks,
  setTasks,
  stores,
  users,
  currentUserRole,
  onLogActivity,
  setNotifications
}: ApprovalsTabProps) {
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');

  const pendingApprovals = tasks.filter(t => t.status === 'Need Review');

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || pendingApprovals[0] || null;

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.name || 'Kanal Umum';
  };

  const getUserDetails = (id: string) => {
    return users.find(u => u.id === id) || users[0];
  };

  // Perform action: Approve
  const handleApprove = (taskId: string) => {
    const reviewerName = users.find(u => u.role === currentUserRole)?.name || 'Lead';
    const taskTitle = tasks.find(t => t.id === taskId)?.title || 'Tugas';
    const assigneeId = tasks.find(t => t.id === taskId)?.assignedTo || '';

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Done'
        };
      }
      return t;
    }));

    // Trigger notification to staff member
    setNotifications(prev => [
      {
        id: `not-${Date.now()}`,
        message: `Tugas Anda "${taskTitle}" telah disetujui sepenuhnya oleh ${reviewerName}.`,
        time: 'Baru saja',
        unread: true,
      },
      ...prev
    ]);

    onLogActivity('Task', 'Persetujuan Selesai', `Tugas "${taskTitle}" disetujui oleh Lead.`);
    setSelectedTaskId('');
  };

  // Perform action: Request Revision
  const handleReject = (taskId: string) => {
    if (!revisionFeedback.trim()) return;

    const reviewerName = users.find(u => u.role === currentUserRole)?.name || 'Lead';
    const taskTitle = tasks.find(t => t.id === taskId)?.title || 'Tugas';
    const assigneeId = tasks.find(t => t.id === taskId)?.assignedTo || '';

    const newComment = {
      id: `c-${Date.now()}`,
      text: `REVISI DIHARUSKAN: ${revisionFeedback}`,
      author: reviewerName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Revision',
          comments: [...t.comments, newComment]
        };
      }
      return t;
    }));

    // Trigger notification to staff member
    setNotifications(prev => [
      {
        id: `not-${Date.now()}`,
        message: `Permintaan Revisi: "${taskTitle}" dikembalikan oleh ${reviewerName}.`,
        time: 'Baru saja',
        unread: true,
      },
      ...prev
    ]);

    onLogActivity('Task', 'Permintaan Revisi', `Mengevaluasi re-brief untuk tugas "${taskTitle}".`);
    setRevisionFeedback('');
    setSelectedTaskId('');
  };

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Antrean Tinju & Persetujuan (Approvals)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Validasi pengerjaan kreatif, setting campaign double-date, dan tautan promo di bawah batasan SLA organisasi Anda.
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="bg-white p-16 select-none border border-dashed border-gray-200 text-center rounded-2xl max-w-2xl mx-auto space-y-4">
          <ShieldCheck className="w-12 h-12 text-green-600 mx-auto" />
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Semua Persetujuan Selesai</h4>
            <p className="text-xs text-gray-400 mt-1">Tidak ada tugas dalam antrean "Need Review" saat ini.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none">
          
          {/* Inbox Queue sidebar list */}
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Antrean Berkas Ke-PIC:</span>
            
            <div className="space-y-2.5">
              {pendingApprovals.map((t) => {
                const pic = getUserDetails(t.assignedTo);
                const isSelected = selectedTask?.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setRevisionFeedback('');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between hover:bg-white hover:shadow-xs ${
                      isSelected ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-50/70' : 'bg-gray-50/70 border-gray-100'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <h4 className="font-bold text-xs text-gray-800 truncate leading-snug">{t.title}</h4>
                      <p className="text-[10px] text-gray-400">Toko: <span className="font-semibold text-gray-600 truncate">{getStoreName(t.storeId)}</span></p>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-[9px] flex items-center justify-center font-bold">
                        {pic.avatar}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Verification Card */}
          {selectedTask && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              
              <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">WAITING REVIEW</span>
                    <span className="text-xs font-mono text-gray-400 font-bold">Tenggat harian: {selectedTask.deadline}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-gray-800 tracking-tight mt-1.5">{selectedTask.title}</h3>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold text-[10px]">Staf Pengirim (PIC)</p>
                  <p className="text-xs font-bold text-gray-700 mt-0.5">{getUserDetails(selectedTask.assignedTo).name}</p>
                </div>
              </div>

              {/* Task descriptions */}
              <div className="space-y-2">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Brief Asli Brief:</span>
                <p className="p-3.5 bg-gray-50 rounded-xl leading-relaxed text-xs text-gray-600 border border-gray-100">
                  {selectedTask.description}
                </p>
              </div>

              {/* Checklists items */}
              {selectedTask.checklist.length > 0 && (
                <div className="space-y-2 select-none">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Checklists Kepatuhan SOP:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-gray-700">
                    {selectedTask.checklist.map((item, id) => (
                      <div key={id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-50">
                        <Check className={`w-3.5 h-3.5 ${item.done ? 'text-green-600 font-extrabold' : 'text-gray-300'}`} />
                        <span className={item.done ? 'line-through text-gray-400' : ''}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof URL Link Display with visual representation */}
              <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/60 space-y-3">
                <span className="text-[10px] font-extrabold text-blue-900 block uppercase tracking-wider">Hasil File Review (Deliverable)</span>
                
                {selectedTask.proofUrl ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-blue-950 truncate max-w-[240px]">{selectedTask.proofUrl}</p>
                      <p className="text-[10px] text-gray-400">Diselesaikan sesuai panduan branding.</p>
                    </div>
                    
                    <a
                      href={selectedTask.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 p-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shrink-0 shadow-xs"
                    >
                      <span>Inspeksi File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">Diserahkan tanpa berkas eksternal.</p>
                )}
              </div>

              {/* Action buttons & feedback commenting */}
              <div className="pt-4 border-t border-gray-50 space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedTask.id)}
                    className="flex-1 inline-flex justify-center items-center space-x-1.5 p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lulus Kualifikasi & Setujui</span>
                  </button>
                </div>

                {/* Revision box */}
                <div className="p-4 bg-red-50/30 rounded-xl border border-red-100/60 space-y-3">
                  <span className="text-[10px] font-extrabold text-rose-900 block uppercase tracking-wider">Koreksi & Permintaan Revisi</span>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Masukkan poin kesalahan detail agar PIC bisa menindaklanjuti..."
                      className="flex-1 bg-white border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                    <button
                      onClick={() => handleReject(selectedTask.id)}
                      disabled={!revisionFeedback.trim()}
                      className="p-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 transition shrink-0"
                    >
                      Kirim Revisi
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
