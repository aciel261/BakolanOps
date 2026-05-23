import React, { useState, useMemo, useEffect } from 'react';

// Shared types and database seeding
import { 
  INITIAL_USERS, 
  INITIAL_STORES, 
  INITIAL_TASKS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_ADS, 
  INITIAL_PRODUCTS, 
  INITIAL_SOPS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_LOGS 
} from './data';
import { User, Store, Task, Campaign, AdPerformance, Product, Notification, ActivityLog } from './types';

// Supabase Adapters
import {
  isSupabaseConfigured,
  seedDatabaseIfEmpty,
  fetchUsers,
  upsertUser,
  fetchStores,
  upsertStore,
  deleteStore,
  fetchTasks,
  upsertTask,
  deleteTask,
  fetchCampaigns,
  upsertCampaign,
  deleteCampaign,
  fetchAds,
  upsertAd,
  deleteAd,
  fetchProducts,
  upsertProduct,
  deleteProduct,
  fetchNotifications,
  upsertNotification,
  deleteNotification,
  fetchLogs,
  appendLog,
  SUPABASE_SQL_SCHEMA
} from './lib/supabase';

// Modular Component imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StoresTab from './components/StoresTab';
import TasksTab from './components/TasksTab';
import CampaignsTab from './components/CampaignsTab';
import AdsTab from './components/AdsTab';
import ProductsTab from './components/ProductsTab';
import ApprovalsTab from './components/ApprovalsTab';
import ReportsTab from './components/ReportsTab';
import TeamTab from './components/TeamTab';
import SopsTab from './components/SopsTab';
import ActivityLogsTab from './components/ActivityLogsTab';
import LoginRegister from './components/LoginRegister';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Core synchronized React States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('marketops_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [ads, setAds] = useState<AdPerformance[]>(INITIAL_ADS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // -----------------------------------------------------
  // ASYNC DB LOAD ON MOUNT (If configured)
  // -----------------------------------------------------
  useEffect(() => {
    async function initSupabaseData() {
      if (isSupabaseConfigured) {
        setIsLoading(true);
        try {
          // 1. Initial table auto-seeding
          await seedDatabaseIfEmpty();

          // 2. Load all entities in parallel from Supabase
          const [
            dbUsers,
            dbStores,
            dbTasks,
            dbCampaigns,
            dbAds,
            dbProducts,
            dbNotifications,
            dbLogs
          ] = await Promise.all([
            fetchUsers(),
            fetchStores(),
            fetchTasks(),
            fetchCampaigns(),
            fetchAds(),
            fetchProducts(),
            fetchNotifications(),
            fetchLogs()
          ]);

          setUsers(dbUsers);
          setStores(dbStores);
          setTasks(dbTasks);
          setCampaigns(dbCampaigns);
          setAds(dbAds);
          setProducts(dbProducts);
          setNotifications(dbNotifications);
          setLogs(dbLogs);

          console.log('Seluruh tabel Supabase berhasil disinkronisasi ke React Client!');
        } catch (err) {
          console.error('Koneksi Supabase gagal. Falling back ke simulator lokal:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    initSupabaseData();
  }, []);

  // -----------------------------------------------------
  // DYNAMIC REACTION SYNC WRAPPERS
  // -----------------------------------------------------
  const handleSetStores = (updater: React.SetStateAction<Store[]>) => {
    setStores((prev) => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (isSupabaseConfigured) {
        // Safe database sync in background
        const deletedIds = prev.map(p => p.id).filter(id => !next.map(n => n.id).includes(id));
        deletedIds.forEach(id => deleteStore(id));
        next.forEach(item => upsertStore(item));
      }
      return next;
    });
  };

  const handleSetTasks = (updater: React.SetStateAction<Task[]>) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (isSupabaseConfigured) {
        const deletedIds = prev.map(p => p.id).filter(id => !next.map(n => n.id).includes(id));
        deletedIds.forEach(id => deleteTask(id));
        next.forEach(item => upsertTask(item));
      }
      return next;
    });
  };

  const handleSetCampaigns = (updater: React.SetStateAction<Campaign[]>) => {
    setCampaigns((prev) => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (isSupabaseConfigured) {
        const deletedIds = prev.map(p => p.id).filter(id => !next.map(n => n.id).includes(id));
        deletedIds.forEach(id => deleteCampaign(id));
        next.forEach(item => upsertCampaign(item));
      }
      return next;
    });
  };

  const handleSetAds = (updater: React.SetStateAction<AdPerformance[]>) => {
    setAds((prev) => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (isSupabaseConfigured) {
        const deletedIds = prev.map(p => p.id).filter(id => !next.map(n => n.id).includes(id));
        deletedIds.forEach(id => deleteAd(id));
        next.forEach(item => upsertAd(item));
      }
      return next;
    });
  };

  const handleSetProducts = (updater: React.SetStateAction<Product[]>) => {
    setProducts((prev) => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (isSupabaseConfigured) {
        const deletedIds = prev.map(p => p.id).filter(id => !next.map(n => n.id).includes(id));
        deletedIds.forEach(id => deleteProduct(id));
        next.forEach(item => upsertProduct(item));
      }
      return next;
    });
  };

  const handleSetNotifications = (updater: React.SetStateAction<Notification[]>) => {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      if (isSupabaseConfigured) {
        const deletedIds = prev.map(p => p.id).filter(id => !next.map(n => n.id).includes(id));
        deletedIds.forEach(id => deleteNotification(id));
        next.forEach(item => upsertNotification(item));
      }
      return next;
    });
  };

  // Derive current role helper safely
  const currentUserRole = currentUser?.role || '';

  // ==========================================
  // PERMISSION CHECKER MATRIX (PRD Section 5)
  // ==========================================
  const canAccess = (feature: string): 'Full' | 'Edit' | 'View' | 'Assigned' | 'None' => {
    const role = currentUserRole;
    if (!role) return 'None';
    if (role === 'Lead Marketplace') return 'Full';

    const matrix: Record<string, Record<string, 'Full' | 'Edit' | 'View' | 'Assigned' | 'None'>> = {
      dashboard: { 
         'Marketplace Specialist': 'View', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'View', 
        'Admin / CS': 'View' 
      },
      stores: { 
        'Marketplace Specialist': 'Edit', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'View', 
        'Admin / CS': 'Edit' 
      },
      tasks: { 
        'Marketplace Specialist': 'Assigned', 
        'Ads Specialist': 'Assigned', 
        'Designer / Content': 'Assigned', 
        'Admin / CS': 'Assigned' 
      },
      campaigns: { 
        'Marketplace Specialist': 'Edit', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'View', 
        'Admin / CS': 'View' 
      },
      ads: { 
        'Marketplace Specialist': 'View', 
        'Ads Specialist': 'Full', 
        'Designer / Content': 'None', 
        'Admin / CS': 'View' 
      },
      products: { 
        'Marketplace Specialist': 'Full', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'View', 
        'Admin / CS': 'Edit' 
      },
      approvals: { 
        'Marketplace Specialist': 'None', 
        'Ads Specialist': 'None', 
        'Designer / Content': 'None', 
        'Admin / CS': 'None' 
      },
      reports: { 
        'Marketplace Specialist': 'View', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'None', 
        'Admin / CS': 'View' 
      },
      team: { 
        'Marketplace Specialist': 'None', 
        'Ads Specialist': 'None', 
        'Designer / Content': 'None', 
        'Admin / CS': 'None' 
      },
      sop: { 
        'Marketplace Specialist': 'View', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'View', 
        'Admin / CS': 'View' 
      },
      logs: {
        'Marketplace Specialist': 'View', 
        'Ads Specialist': 'View', 
        'Designer / Content': 'View', 
        'Admin / CS': 'View' 
      }
    };

    return matrix[feature]?.[role] || 'None';
  };

  const hasWritePermission = (feature: string) => {
    const perm = canAccess(feature);
    return perm === 'Full' || perm === 'Edit';
  };

  // Log Activity Helper functions
  const handleLogActivity = (
    type: ActivityLog['entityType'], 
    action: string, 
    details: string
  ) => {
    const currentUserName = currentUser?.name || 'Sistem';
    const newLogItem: ActivityLog = {
      id: `log-${Date.now()}`,
      entityType: type,
      action: action,
      details: details,
      changedBy: currentUserName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    
    setLogs((prev) => [newLogItem, ...prev]);
    if (isSupabaseConfigured) {
      appendLog(newLogItem);
    }
  };

  // Login Success handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('marketops_current_user', JSON.stringify(user));

    // Log Activity automatically
    const loginLog: ActivityLog = {
      id: `log-${Date.now()}`,
      entityType: 'Auth',
      action: 'Login Berhasil',
      details: `${user.name} masuk sebagai ${user.role} (${user.department}).`,
      changedBy: user.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    
    setLogs((prev) => [loginLog, ...prev]);
    if (isSupabaseConfigured) {
      appendLog(loginLog);
    }
  };

  // Register Success handler
  const handleRegisterSuccess = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    if (isSupabaseConfigured) {
      upsertUser(newUser);
    }

    // Log registration
    const regLog: ActivityLog = {
      id: `log-${Date.now()}`,
      entityType: 'Auth',
      action: 'Registrasi Selesai',
      details: `${newUser.name} didaftarkan ke sistem MarketOps sebagai ${newUser.role}.`,
      changedBy: newUser.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    
    setLogs((prev) => [regLog, ...prev]);
    if (isSupabaseConfigured) {
      appendLog(regLog);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (currentUser) {
      const logoutLog: ActivityLog = {
        id: `log-${Date.now()}`,
        entityType: 'Auth',
        action: 'Logout Berhasil',
        details: `${currentUser.name} keluar dari sesi workspace secara aman.`,
        changedBy: currentUser.name,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      
      setLogs((prev) => [logoutLog, ...prev]);
      if (isSupabaseConfigured) {
        appendLog(logoutLog);
      }
    }
    
    setCurrentUser(null);
    localStorage.removeItem('marketops_current_user');
    setActiveTab('dashboard'); // reset to default tab
  };

  // Computed Values
  const totalStores = stores.length;
  const pendingApprovalsCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Need Review').length;
  }, [tasks]);

  // If NOT LOGGED IN, show authentic dynamic Login & Register screen
  if (!currentUser) {
    return (
      <LoginRegister 
        users={users} 
        onLoginSuccess={handleLoginSuccess} 
        onRegisterSuccess={handleRegisterSuccess} 
      />
    );
  }

  return (
    <div id="app-workspace" className="min-h-screen bg-[#F8FAFC] flex text-gray-800 font-sans antialiased relative">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        canAccess={canAccess}
        storesCount={totalStores}
        pendingApprovals={pendingApprovalsCount}
        isSupabaseConfigured={isSupabaseConfigured}
        onShowSetup={() => setShowSetupModal(true)}
      />

      {/* Main portal layout workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Supabase Status Alert Banner for Simulator Mode */}
        {!isSupabaseConfigured && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-150 p-3.5 px-8 flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center space-x-3 text-xs font-semibold text-amber-850">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <p>
                <strong>Mode Simulasi Aktif (In-Memory)</strong>: Data tidak tersimpan permanen di Supabase. Hubungkan ke database Supabase Anda sekarang.
              </p>
            </div>
            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs bg-[#1E3A8A] text-white hover:bg-blue-800 font-extrabold px-3 py-1.5 rounded-lg border border-transparent shadow-xs hover:shadow transition cursor-pointer"
            >
              Hubungkan Supabase & Vercel
            </button>
          </div>
        )}

        {/* Loading overlay during Supabase initialization state */}
        {isLoading && (
          <div className="bg-blue-900/10 backdrop-blur-xs flex flex-col items-center justify-center py-4 px-8 border-b border-blue-100 text-xs font-bold text-blue-900 animate-pulse select-none">
            <div className="flex items-center space-x-2">
              <span className="h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Sinkronisasi tabel real-time dengan Supabase cloud...</span>
            </div>
          </div>
        )}

        {/* Top Header */}
        <Header 
          currentUser={currentUser}
          onLogout={handleLogout}
          notifications={notifications}
          setNotifications={handleSetNotifications}
          onLogActivity={handleLogActivity}
        />

        {/* Dynamic content rendering with secure gate checking */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
          {activeTab === 'dashboard' && canAccess('dashboard') !== 'None' && (
            <Dashboard 
              stores={stores}
              tasks={tasks}
              ads={ads}
              products={products}
              setActiveTab={setActiveTab}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === 'stores' && canAccess('stores') !== 'None' && (
            <StoresTab 
              stores={stores}
              setStores={handleSetStores}
              users={users}
              onLogActivity={handleLogActivity}
              canEdit={hasWritePermission('stores')}
            />
          )}

          {activeTab === 'tasks' && canAccess('tasks') !== 'None' && (
            <TasksTab 
              tasks={tasks}
              setTasks={handleSetTasks}
              stores={stores}
              users={users}
              currentUserRole={currentUserRole}
              onLogActivity={handleLogActivity}
              setNotifications={handleSetNotifications}
            />
          )}

          {activeTab === 'campaigns' && canAccess('campaigns') !== 'None' && (
            <CampaignsTab 
              campaigns={campaigns}
              setCampaigns={handleSetCampaigns}
              stores={stores}
              users={users}
              onLogActivity={handleLogActivity}
              canEdit={hasWritePermission('campaigns')}
            />
          )}

          {activeTab === 'ads' && canAccess('ads') !== 'None' && (
            <AdsTab 
              ads={ads}
              setAds={handleSetAds}
              stores={stores}
              onLogActivity={handleLogActivity}
              canEdit={currentUserRole === 'Lead Marketplace' || currentUserRole === 'Ads Specialist'}
            />
          )}

          {activeTab === 'products' && canAccess('products') !== 'None' && (
            <ProductsTab 
              products={products}
              setProducts={handleSetProducts}
              stores={stores}
              onLogActivity={handleLogActivity}
              canEdit={hasWritePermission('products')}
            />
          )}

          {activeTab === 'approvals' && currentUserRole === 'Lead Marketplace' && (
            <ApprovalsTab 
              tasks={tasks}
              setTasks={handleSetTasks}
              stores={stores}
              users={users}
              currentUserRole={currentUserRole}
              onLogActivity={handleLogActivity}
              setNotifications={handleSetNotifications}
            />
          )}

          {activeTab === 'reports' && canAccess('reports') !== 'None' && (
            <ReportsTab 
              stores={stores}
              campaigns={campaigns}
              ads={ads}
              tasks={tasks}
              onLogActivity={handleLogActivity}
            />
          )}

          {activeTab === 'team' && currentUserRole === 'Lead Marketplace' && (
            <TeamTab 
              users={users}
              tasks={tasks}
            />
          )}

          {activeTab === 'sops' && canAccess('sop') !== 'None' && (
            <SopsTab 
              sops={INITIAL_SOPS}
            />
          )}

          {activeTab === 'logs' && canAccess('logs') !== 'None' && (
            <ActivityLogsTab 
              logs={logs}
              setLogs={setLogs}
            />
          )}
        </main>

      </div>

      {/* CONNECTION GATE DIALOG / MODAL */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative select-text shadow-2xl border border-gray-100 flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center space-x-3.5">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-2xl border border-emerald-100">
                  <span className="font-extrabold text-lg block leading-none">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#111822]">Koneksi Eksklusif Supabase & Vercel</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Langkah detail menghubungkan database dan storage Anda.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSetupModal(false)}
                className="p-1 px-2.5 bg-gray-100 hover:bg-gray-250 text-gray-500 font-bold text-sm rounded-lg transition cursor-pointer select-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 text-[#334155] text-xs leading-relaxed overflow-y-auto max-h-[55vh] pr-2">
              
              {/* Box Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1E3A8A]/5 border border-blue-100 p-4 rounded-2xl">
                  <h4 className="font-bold text-[#1E3A8A] text-sm flex items-center gap-1.5 mb-2">
                    <span>1. Menghubungkan Melalui Vercel</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 font-medium text-gray-750">
                    <li>Buka dashboard proyek Anda di platform <strong className="text-black text-xs font-bold">Vercel</strong>.</li>
                    <li>Pilih menu <strong className="text-black font-semibold">Settings</strong> lalu klik <strong className="text-black font-semibold">Environment Variables</strong> di sisi kiri.</li>
                    <li>Tambahkan 2 variabel lingkungan di bawah ini:
                      <div className="bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-[10px] mt-1.5 space-y-1 block border border-slate-800">
                        <span className="block text-[#34D399]">VITE_SUPABASE_URL</span>
                        <span className="block text-gray-400 font-sans text-[8px]">Isi dengan url project API Supabase Anda.</span>
                        <span className="block text-[#34D399] pt-1">VITE_SUPABASE_ANON_KEY</span>
                        <span className="block text-gray-400 font-sans text-[8px]">Isi dengan public anonymous service key Supabase Anda.</span>
                      </div>
                    </li>
                    <li>Selesai! Klik <strong className="text-black font-semibold">Save</strong>, lalu lakukan Redeploy proyek di Vercel agar perubahan diterapkan.</li>
                  </ol>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl">
                  <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5 mb-2">
                    <span>2. Cara Inisialisasi Database (SQL)</span>
                  </h4>
                  <p className="font-medium text-gray-750 mb-2">
                    Masuk ke aplikasi <strong className="text-black font-bold">Supabase Console</strong>, lalu buka menu <strong className="text-emerald-800 font-semibold">SQL Editor</strong>. Buat query baru, copy-paste seluruh baris kode schema di bawah ini, lalu jalankan/run!
                  </p>
                  <p className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[10px] font-semibold text-emerald-900">
                    💡 Sistem akan secara otomatis mendeteksi jika tabel kosong dan men-seed seluruh data awal simulasi (PIC, Toko, Tugas, SOP) langsung ke database Supabase Anda saat koneksi pertama berhasil disinkronisasi!
                  </p>
                </div>
              </div>

              {/* SQL Schema TextArea Panel */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center bg-gray-800 text-white rounded-t-xl p-2 px-4 shadow-sm select-none">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#34D399]">SUPABASE_DATABASE_SCHEMA.SQL</span>
                  <span className="text-[9px] text-gray-300 font-semibold">Blok kode lengkap siap pakai</span>
                </div>
                <textarea
                  readOnly
                  value={SUPABASE_SQL_SCHEMA}
                  className="w-full h-48 p-4 bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[10px] rounded-b-xl outline-none focus:ring-0 leading-relaxed resize-none cursor-text shadow-inner"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <span className="text-[10px] text-gray-400 block text-right">
                  Klik di dalam kotak di atas untuk memblok seluruh teks schema (Ctrl+A / Cmd+A) lalu lakukan Copy.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 pt-4 mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="p-3 px-6 bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold rounded-xl transition cursor-pointer select-none text-xs shadow-md shadow-blue-900/10"
              >
                Saya Selesai Menyiapkan Supabase
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

