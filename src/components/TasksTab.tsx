import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Grid, 
  List, 
  CheckSquare, 
  Search, 
  Calendar as CalendarIcon, 
  Paperclip, 
  User, 
  MessageSquare,
  AlertCircle,
  X,
  Send,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Task, Store, User as AppUser, ChecklistItem } from '../types';

interface TasksTabProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  stores: Store[];
  users: AppUser[];
  currentUserRole: string;
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function TasksTab({
  tasks,
  setTasks,
  stores,
  users,
  currentUserRole,
  onLogActivity,
  setNotifications,
}: TasksTabProps) {
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterStoreId, setFilterStoreId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storeId: stores[0]?.id || 'store-1',
    assignedTo: 'usr-2',
    department: 'Operations' as Task['department'],
    priority: 'High' as Task['priority'],
    deadline: '',
    checklistText: '',
  });

  // Proof submittal draft URL
  const [proofUrlInput, setProofUrlInput] = useState('');
  // Custom quick comments draft
  const [commentInput, setCommentInput] = useState('');

  const currentUserId = useMemo(() => {
    return users.find(u => u.role === currentUserRole)?.id || 'usr-1';
  }, [currentUserRole, users]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStore = filterStoreId === 'All' || t.storeId === filterStoreId;
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStore && matchSearch;
    });
  }, [tasks, filterStoreId, searchQuery]);

  // Handle creating new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const checklistItems: ChecklistItem[] = formData.checklistText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({ text, done: false }));

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      storeId: formData.storeId,
      assignedTo: formData.assignedTo,
      department: formData.department,
      priority: formData.priority,
      deadline: formData.deadline || new Date().toISOString().split('T')[0],
      status: 'Todo',
      checklist: checklistItems,
      createdBy: currentUserId,
      createdAt: new Date().toISOString().split('T')[0],
      comments: [],
    };

    setTasks((prev) => [...prev, newTask]);
    onLogActivity('Task', 'Buat Tugas Baru', `Membuat penugasan "${formData.title}" kepada ${users.find(u => u.id === formData.assignedTo)?.name || 'staff'}.`);
    
    // Auto notify assignee
    setNotifications((prev) => [
      {
        id: `not-${Date.now()}`,
        message: `Tugas baru ditugaskan kepada Anda: "${formData.title}"`,
        time: 'Baru saja',
        unread: true,
      },
      ...prev,
    ]);

    setIsCreateModalOpen(false);
    // Reset
    setFormData({
      title: '',
      description: '',
      storeId: stores[0]?.id || 'store-1',
      assignedTo: 'usr-2',
      department: 'Operations',
      priority: 'High',
      deadline: '',
      checklistText: '',
    });
  };

  // Toggle sub-checklist item status
  const handleToggleChecklist = (taskId: string, itemIndex: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedChecklist = t.checklist.map((item, index) => 
          index === itemIndex ? { ...item, done: !item.done } : item
        );
        const taskUpdated = { ...t, checklist: updatedChecklist };
        // Sync selected detail view too if it's the active view
        if (selectedTask?.id === taskId) {
          setSelectedTask(taskUpdated);
        }
        return taskUpdated;
      }
      return t;
    }));
  };

  // Submit proof URL to trigger "Need Review"
  const handleSubmitProof = (taskId: string) => {
    if (!proofUrlInput.trim()) return;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const taskUpdated: Task = {
          ...t,
          status: 'Need Review',
          proofUrl: proofUrlInput,
        };
        if (selectedTask?.id === taskId) {
          setSelectedTask(taskUpdated);
        }
        return taskUpdated;
      }
      return t;
    }));

    // Raise notification to Lead
    setNotifications(prev => [
      {
        id: `not-${Date.now()}`,
        message: `Tugas "${tasks.find(t => t.id === taskId)?.title}" selesai dikerjakan, butuh review Anda.`,
        time: 'Baru saja',
        unread: true,
      },
      ...prev
    ]);

    onLogActivity('Task', 'Kirim Bukti Tugas', `Submit link pengerjaan tugas ID ${taskId}.`);
    setProofUrlInput('');
  };

  // Move task status in general
  const handleUpdateStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const tUp: Task = { ...t, status: newStatus };
        if (selectedTask?.id === taskId) {
          setSelectedTask(tUp);
        }
        return tUp;
      }
      return t;
    }));
    onLogActivity('Task', 'Ubah Status', `Memindahkan status tugas ID ${taskId} ke "${newStatus}".`);
  };

  // Post Comment Inside Task Drawer
  const handleAddComment = (taskId: string) => {
    if (!commentInput.trim()) return;

    const reviewerName = users.find(u => u.role === currentUserRole)?.name || 'System';
    const newComment = {
      id: `c-${Date.now()}`,
      text: commentInput,
      author: reviewerName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const taskUpdated: Task = {
          ...t,
          comments: [...t.comments, newComment],
        };
        if (selectedTask?.id === taskId) {
          setSelectedTask(taskUpdated);
        }
        return taskUpdated;
      }
      return t;
    }));

    setCommentInput('');
  };

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.name || 'Kanal Umum';
  };

  const getUserDetails = (id: string) => {
    return users.find(u => u.id === id) || users[0];
  };

  const kanbanColumns: { id: Task['status']; label: string; bg: string; border: string; text: string }[] = [
    { id: 'Todo', label: 'Belum Dimulai (Todo)', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
    { id: 'In Progress', label: 'Pengerjaan (In Progress)', bg: 'bg-blue-50/40', border: 'border-blue-100', text: 'text-blue-900' },
    { id: 'Need Review', label: 'Butuh Review (SLA)', bg: 'bg-amber-50/40', border: 'border-amber-100', text: 'text-amber-900 animate-pulse' },
    { id: 'Revision', label: 'Revisi (Revision)', bg: 'bg-rose-50/40', border: 'border-rose-100', text: 'text-rose-900' },
    { id: 'Done', label: 'Selesai (Done)', bg: 'bg-green-50/40', border: 'border-green-100', text: 'text-green-900' },
  ];

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Top action header section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Kerja Operasional</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau beban kerja harian, bagikan tanggung jawab PIC, dan tinjau kemajuan berdasarkan batas waktu platform.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-1 flex space-x-1 outline-none">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-85 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci tugas atau deskripsi..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 pl-10 focus:ring-1 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono shrink-0">Filter Store:</span>
          <select
            value={filterStoreId}
            onChange={(e) => setFilterStoreId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg p-2 px-3 outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">Semua Toko Marketplace</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.marketplace})</option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER KANBAN VIEW OR LIST VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 overflow-x-auto select-none items-start">
          {kanbanColumns.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className={`p-4 rounded-2xl border ${col.border} ${col.bg} flex flex-col min-h-[500px] w-full`}
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4 select-none">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${col.text}`}>
                    {col.label}
                  </span>
                  <span className="bg-gray-200/80 text-gray-700 font-bold font-mono text-xs px-2.5 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3.5 flex-1 max-h-[600px] overflow-y-auto pr-1">
                  {columnTasks.map((task) => {
                    const doneSubTasks = task.checklist.filter(item => item.done).length;
                    const totalSubTasks = task.checklist.length;
                    const pic = getUserDetails(task.assignedTo);

                    let priorityColor = 'bg-gray-100 text-gray-700';
                    if (task.priority === 'High') priorityColor = 'bg-amber-100 text-amber-800 font-bold';
                    if (task.priority === 'Critical') priorityColor = 'bg-red-100 text-red-800 font-bold animate-pulse';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:border-blue-400 cursor-pointer transition duration-150 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${priorityColor}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold">Mei {task.deadline.split('-')[2]}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-gray-800 hover:text-blue-600 transition truncate leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {getStoreName(task.storeId)}
                          </p>
                        </div>

                        {/* Checklist Counter representation */}
                        {totalSubTasks > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] text-gray-400 font-mono font-bold">
                              <span>Sub-Task Checklist</span>
                              <span>{doneSubTasks}/{totalSubTasks} ({Math.round((doneSubTasks/totalSubTasks)*100)}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${(doneSubTasks/totalSubTasks)*100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1.5 text-gray-500">
                            <div className="w-5 h-5 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-full text-[9px] flex items-center justify-center uppercase shrink-0">
                              {pic.avatar}
                            </div>
                            <span className="text-[10px] truncate max-w-[80px] font-semibold">{pic.name}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-gray-400 text-[10px] font-mono">
                            {task.comments.length > 0 && (
                              <div className="flex items-center space-x-0.5">
                                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                            {task.proofUrl && (
                              <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <p className="text-[10px] text-gray-400 text-center italic py-10">Kosong</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden select-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="p-4 pl-6">Detail Tugas Kerja</th>
                <th className="p-4">Toko Marketplace</th>
                <th className="p-4">Prioritas</th>
                <th className="p-4">Tenggat Waktu</th>
                <th className="p-4">Status</th>
                <th className="p-4">Penerima PIC</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada pengajuan tugas saat ini.</td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const pic = getUserDetails(task.assignedTo);
                  
                  let priorityColor = 'bg-gray-100 text-gray-700';
                  if (task.priority === 'High') priorityColor = 'bg-amber-100 text-amber-800';
                  if (task.priority === 'Critical') priorityColor = 'bg-red-100 text-red-800';

                  let statusBadge = 'bg-gray-100 text-gray-600';
                  if (task.status === 'In Progress') statusBadge = 'bg-blue-100 text-blue-800';
                  if (task.status === 'Need Review') statusBadge = 'bg-amber-100 text-amber-800 animate-pulse';
                  if (task.status === 'Revision') statusBadge = 'bg-rose-100 text-rose-800';
                  if (task.status === 'Done') statusBadge = 'bg-green-100 text-green-800';

                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 transition duration-150">
                      <td className="p-4 pl-6 font-semibold text-gray-800">
                        <div>
                          <p onClick={() => setSelectedTask(task)} className="font-bold text-gray-800 hover:text-blue-600 cursor-pointer">{task.title}</p>
                          <p className="text-[10px] text-gray-400 font-normal mt-0.5 truncate max-w-sm">{task.description}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-medium">{getStoreName(task.storeId)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${priorityColor}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 font-mono font-semibold">{task.deadline}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5 text-gray-700">
                          <div className="w-6 h-6 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-[9px] flex items-center justify-center font-bold font-mono">
                            {pic.avatar}
                          </div>
                          <span>{pic.name}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 p-1.5 px-3 rounded-lg text-xs font-bold transition"
                        >
                          Ulas Kerja
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL VIEW DRAWER SIDE PANEL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop screen grey */}
          <div 
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setSelectedTask(null)}
          />
          
          <div className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 animate-slide-left z-10 text-gray-800">
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-gray-100 bg-[#1E3A8A] text-white flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded font-mono uppercase">
                    ID: {selectedTask.id}
                  </span>
                  <h3 className="font-extrabold text-base tracking-tight truncate mt-1.5">{selectedTask.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-180px)]">
                
                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Toko Asosiasi</p>
                    <p className="font-semibold text-gray-700 mt-0.5">{getStoreName(selectedTask.storeId)}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Batas Penyerahan</p>
                    <p className="font-semibold font-mono text-gray-700 mt-0.5">{selectedTask.deadline}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Deskripsi Penugasan</p>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Checklist subtasks representation */}
                {selectedTask.checklist.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Kemajuan Sub-SOP Checklist</p>
                    <div className="space-y-1.5">
                      {selectedTask.checklist.map((item, index) => (
                        <label 
                          key={index}
                          className="flex items-center space-x-2.5 bg-gray-50 p-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => handleToggleChecklist(selectedTask.id, index)}
                            className="h-3.5 w-3.5 text-blue-600 border-gray-200 rounded focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-xs ${item.done ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload proof workspace */}
                {selectedTask.status !== 'Done' && (
                  <div className="p-4 border border-blue-100 bg-blue-50/25 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" /> Penyerahan Berkas Bukti (Proof of Work)
                    </h5>
                    
                    {selectedTask.proofUrl ? (
                      <div className="p-2.5 bg-white rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                        <span className="text-blue-700 underline truncate max-w-[200px]">{selectedTask.proofUrl}</span>
                        <a href={selectedTask.proofUrl} target="_blank" rel="noreferrer" className="text-blue-900 font-bold flex items-center gap-0.5">
                          Buka <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400">Pastikan file drive/brief diinput di bawah sebelum menyerahkan.</p>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={proofUrlInput}
                        onChange={(e) => setProofUrlInput(e.target.value)}
                        placeholder="Masukkan URL drive / tautan gambar..."
                        className="flex-1 bg-white border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                      <button
                        onClick={() => handleSubmitProof(selectedTask.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 rounded-lg transition"
                      >
                        Kirim
                      </button>
                    </div>
                  </div>
                )}

                {/* MANUAL STATUS OVERRIDER */}
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Perbarui Status Tugas Secara Manual:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Todo', 'In Progress', 'Done'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedTask.id, st as Task['status'])}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          selectedTask.status === st 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* COMMENTS MODULE */}
                <div className="space-y-3.5 pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Kolom Diskusi ({selectedTask.comments.length})
                  </p>
                  
                  <div className="space-y-2.5 max-h-44 overflow-y-auto bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                    {selectedTask.comments.length === 0 ? (
                      <p className="text-[10px] text-gray-400 text-center py-4">Belum ada diskusi.</p>
                    ) : (
                      selectedTask.comments.map((comm) => (
                        <div key={comm.id} className="bg-white p-2.5 rounded-lg border border-gray-50 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[10px] text-gray-700">{comm.author}</span>
                            <span className="text-[8px] text-gray-400 font-mono">{comm.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{comm.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Tulis pesan penyelesaian / keterangan..."
                      className="flex-1 bg-white border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(selectedTask.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DANGER ZONE FOR LEAD ROLE */}
                {currentUserRole === 'Lead Marketplace' && (
                  <div className="pt-4 mt-6 border-t border-red-100 bg-red-50/30 p-4 rounded-xl space-y-2 select-none">
                    <p className="text-[10px] text-red-800 font-extrabold uppercase tracking-wider">Zona Bahaya (Lead Only)</p>
                    {confirmDeleteId === selectedTask.id ? (
                      <div className="flex items-center justify-between bg-red-100/50 p-2.5 rounded-lg border border-red-200 animate-fade-in">
                        <span className="text-[10px] text-red-900 font-extrabold">Hapus tugas ini sekarang?</span>
                        <div className="flex gap-1.5 animate-fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
                              onLogActivity('Task', 'Hapus Tugas', `Menghapus penugasan "${selectedTask.title}" (ID: ${selectedTask.id}).`);
                              setSelectedTask(null);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg transition"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-white hover:bg-gray-100 text-gray-705 border border-gray-200 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(selectedTask.id)}
                        className="w-full bg-red-55 hover:bg-red-100/80 text-red-600 border border-red-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Hapus Tugas Kerja</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL FORM */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Buat Penugasan Tim Baru</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Judul Tugas / Pekerjaan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Setting Flash Sale Shopee Gajian"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Deskripsi Teknis (Brief)</label>
                <textarea
                  required
                  value={formData.description}
                  rows={2}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Instruksi SOP spesifik yang mesti ditaati..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Toko Marketplace</label>
                  <select
                    value={formData.storeId}
                    onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tugaskan PIC Staff</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Divisi (Divisi)</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value as Task['department']})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Creative">Creative</option>
                    <option value="Customer Service">Customer Service</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Prioritas SLA</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as Task['priority']})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tenggat Waktu</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Item Sub-SOP Checklists (Satu baris ke bawah)</label>
                <textarea
                  value={formData.checklistText}
                  rows={3}
                  onChange={(e) => setFormData({...formData, checklistText: e.target.value})}
                  placeholder="Riset kata kunci Shopee Coach&#10;Update 10 produk terbaik&#10;Atur kuota voucher cashback"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none resize-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Tugaskan Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
