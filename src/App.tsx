import React, { useState, useMemo } from 'react';

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
import { Store, Task, Campaign, AdPerformance, Product, Notification, ActivityLog } from './types';

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

export default function App() {
  
  // Dynamic Role Simulation Switcher
  const [currentUserRole, setCurrentUserRole] = useState<string>('Lead Marketplace');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Unified State Engine
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [ads, setAds] = useState<AdPerformance[]>(INITIAL_ADS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // ==========================================
  // PERMISSION CHECKER MATRIX (PRD Section 5)
  // ==========================================
  const canAccess = (feature: string): 'Full' | 'Edit' | 'View' | 'Assigned' | 'None' => {
    const role = currentUserRole;
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
    const currentUserName = INITIAL_USERS.find(u => u.role === currentUserRole)?.name || 'Sistem';
    const newLogItem: ActivityLog = {
      id: `log-${Date.now()}`,
      entityType: type,
      action: action,
      details: details,
      changedBy: currentUserName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLogs((prev) => [newLogItem, ...prev]);
  };

  // Computed Values
  const totalStores = stores.length;
  const pendingApprovalsCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Need Review').length;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-gray-800 font-sans antialiased">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        canAccess={canAccess}
        storesCount={totalStores}
        pendingApprovals={pendingApprovalsCount}
      />

      {/* Main portal layout workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <Header 
          currentUserRole={currentUserRole}
          setCurrentUserRole={(role) => {
            setCurrentUserRole(role);
            // reset view if changed role restricts current tab
            if (canAccess(activeTab === 'sops' ? 'sop' : activeTab) === 'None') {
              setActiveTab('dashboard');
            }
          }}
          users={INITIAL_USERS}
          notifications={notifications}
          setNotifications={setNotifications}
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
              setStores={setStores}
              users={INITIAL_USERS}
              onLogActivity={handleLogActivity}
              canEdit={hasWritePermission('stores')}
            />
          )}

          {activeTab === 'tasks' && canAccess('tasks') !== 'None' && (
            <TasksTab 
              tasks={tasks}
              setTasks={setTasks}
              stores={stores}
              users={INITIAL_USERS}
              currentUserRole={currentUserRole}
              onLogActivity={handleLogActivity}
              setNotifications={setNotifications}
            />
          )}

          {activeTab === 'campaigns' && canAccess('campaigns') !== 'None' && (
            <CampaignsTab 
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              stores={stores}
              users={INITIAL_USERS}
              onLogActivity={handleLogActivity}
              canEdit={hasWritePermission('campaigns')}
            />
          )}

          {activeTab === 'ads' && canAccess('ads') !== 'None' && (
            <AdsTab 
              ads={ads}
              setAds={setAds}
              stores={stores}
              onLogActivity={handleLogActivity}
              canEdit={currentUserRole === 'Lead Marketplace' || currentUserRole === 'Ads Specialist'}
            />
          )}

          {activeTab === 'products' && canAccess('products') !== 'None' && (
            <ProductsTab 
              products={products}
              setProducts={setProducts}
              stores={stores}
              onLogActivity={handleLogActivity}
              canEdit={hasWritePermission('products')}
            />
          )}

          {activeTab === 'approvals' && currentUserRole === 'Lead Marketplace' && (
            <ApprovalsTab 
              tasks={tasks}
              setTasks={setTasks}
              stores={stores}
              users={INITIAL_USERS}
              currentUserRole={currentUserRole}
              onLogActivity={handleLogActivity}
              setNotifications={setNotifications}
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
              users={INITIAL_USERS}
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

    </div>
  );
}
