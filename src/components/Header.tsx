import React, { useState, useMemo } from 'react';
import { Bell, Check, UserCheck, Inbox } from 'lucide-react';
import { User, Notification } from '../types';

interface HeaderProps {
  currentUserRole: string;
  setCurrentUserRole: (role: string) => void;
  users: User[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
}

export default function Header({
  currentUserRole,
  setCurrentUserRole,
  users,
  notifications,
  setNotifications,
  onLogActivity,
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const currentUser = useMemo(() => {
    return users.find((u) => u.role === currentUserRole) || users[0];
  }, [currentUserRole, users]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    onLogActivity('System', 'Tandai Semua Notifikasi', 'Membaca semua notifikasi di inbox panel.');
  };

  const handleMarkOneRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-30 sticky top-0 shadow-xs">
      
      {/* Dynamic Role SWITCHURAL */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
          <UserCheck className="w-[18px] h-[18px] text-blue-700" />
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Simulasi Hak Akses:</span>
          <select
            value={currentUserRole}
            onChange={(e) => {
              setCurrentUserRole(e.target.value);
              onLogActivity('Auth', 'Ganti Peran Simulasi', `Role diganti ke ${e.target.value}`);
            }}
            className="bg-blue-50/80 hover:bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 px-3 cursor-pointer outline-none transition"
          >
            {users.map((u) => (
              <option key={u.id} value={u.role}>
                {u.role} ({u.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* NOTIFICATION CENTER */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative transition-all"
          >
            <span className="sr-only">Notifications</span>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>

          {/* NOTIFICATION DROPDOWN BLOCK */}
          {showNotificationDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotificationDropdown(false)} 
              />
              <div className="absolute right-0 mt-3 w-85 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50 animate-fade-in text-gray-800">
                <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                  <span className="font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Inbox className="w-3.5 h-3.5 text-blue-600" /> Notifikasi ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                    >
                      Baca Semua
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">Tidak ada notifikasi baru.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkOneRead(n.id)}
                        className={`p-3.5 text-xs transition duration-150 cursor-pointer ${
                          n.unread ? 'bg-blue-50/45 hover:bg-blue-50 font-medium' : 'hover:bg-gray-50 text-gray-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-gray-800 leading-relaxed">{n.message}</p>
                          {n.unread && (
                            <span className="h-1.5 w-1.5 mt-1 bg-blue-600 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-mono">{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* LOGGED IN USER DETAILS */}
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200 select-none">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
            <div className="flex items-center justify-end space-x-1.5">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
              <p className="text-[10px] text-gray-400 font-mono tracking-tight font-semibold uppercase">
                {currentUser.department} STAFF
              </p>
            </div>
          </div>
          <div className="w-9 h-9 bg-[#1E3A8A] border-2 border-blue-200 rounded-full flex items-center justify-center text-white font-extrabold shadow-sm text-xs uppercase">
            {currentUser.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
