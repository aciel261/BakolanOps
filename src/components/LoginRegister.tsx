import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  HelpCircle,
  Database
} from 'lucide-react';
import { User as AppUser } from '../types';

interface LoginRegisterProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
  onRegisterSuccess: (newUser: AppUser, password?: string) => void;
}

export default function LoginRegister({
  users,
  onLoginSuccess,
  onRegisterSuccess
}: LoginRegisterProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState('Marketplace Specialist');
  const [regDept, setRegDept] = useState('Operations');
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Automatically update department based on role for a smooth UX
  const handleRoleChange = (role: string) => {
    setRegRole(role);
    if (role === 'Lead Marketplace') setRegDept('Management');
    else if (role === 'Marketplace Specialist') setRegDept('Operations');
    else if (role === 'Ads Specialist') setRegDept('Marketing');
    else if (role === 'Designer / Content') setRegDept('Creative');
    else if (role === 'Admin / CS') setRegDept('Customer Service');
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Harap masukkan email dan kata sandi Anda.');
      return;
    }

    const cleanedEmail = loginEmail.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanedEmail);

    if (!foundUser) {
      setLoginError('Email tidak terdaftar pada sistem MarketOps-Workspace.');
      return;
    }

    // Passwords for initial users can be password123 or demo.
    // Let's support the registered users password check from localStorage if present
    const storedPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
    const expectedPassword = storedPasswords[foundUser.email.toLowerCase()] || 'password123';

    if (loginPassword !== expectedPassword && loginPassword !== 'password123') {
      setLoginError('Kata sandi salah. Gunakan "password123" untuk demo atau periksa kembali.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  // Register handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Lengkapi semua field formulir pendaftaran.');
      return;
    }

    const cleanedEmail = regEmail.trim().toLowerCase();
    const emailExists = users.some(u => u.email.toLowerCase() === cleanedEmail);

    if (emailExists) {
      setRegError('Email sudah terdaftar. Silakan gunakan email lain atau masuk.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Kata sandi harus minimal 6 karakter demi keamanan akun.');
      return;
    }

    // Generate avatar initials
    const nameParts = regName.trim().split(' ');
    const avatar = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: cleanedEmail,
      role: regRole,
      department: regDept,
      avatar,
      active: true
    };

    // Save password
    const storedPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
    storedPasswords[cleanedEmail] = regPassword;
    localStorage.setItem('user_passwords', JSON.stringify(storedPasswords));

    onRegisterSuccess(newUser, regPassword);
    setRegSuccessMsg('Pendaftaran berhasil! Mengarahkan Anda ke dashboard...');
    
    // Auto clear
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 1200);
  };

  // Helper function to quick-login demo accounts
  const handleQuickLogin = (demoUser: AppUser) => {
    setLoginEmail(demoUser.email);
    setLoginPassword('password123');
    onLoginSuccess(demoUser);
  };

  return (
    <div id="auth-portal" className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      
      {/* Container Box */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Aesthetic brand column */}
        <div className="lg:col-span-5 bg-[#1E3A8A] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative blurred backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-650 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-800 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20" />

          {/* Top Info */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <span className="bg-blue-600 p-2 rounded-xl text-white font-extrabold text-xl leading-none">M</span>
              <div>
                <span className="font-extrabold text-xl tracking-wider block">MarketOps</span>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest font-mono">WORKSPACE</span>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight mt-6">
              Sistem Operasional & Dashboard multi-role terpadu
            </h2>
            <p className="text-sm text-blue-200 mt-4 leading-relaxed">
              Login ke sistem untuk memantau performa toko di marketplace, membagi target GMV harian, melacak ROI iklan, dan memeriksa standardisasi kualitas listing sesuai peran atau tim Anda.
            </p>
          </div>

          {/* Middle Bullet highlights info */}
          <div className="my-8 space-y-4 relative z-10 text-xs text-blue-150 border-y border-blue-900/60 py-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block">Hak Akses Fleksibel (Dynamic Matrix Permissions)</strong>
                Sistem akan menyaring menu, data, dan tombol aksi berdasarkan peran kepemilikan atau departemen Anda.
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block">Audit Trail & Log Akurat</strong>
                Setiap aksi bisnis (tugas selesai, iklan diubah, campaign dimulai) direkam otomatis untuk audit akuntabilitas.
              </div>
            </div>
          </div>

          {/* Bottom Branding Footer */}
          <div className="relative z-10 text-[11px] text-blue-300 font-mono flex items-center justify-between border-t border-blue-900/40 pt-4">
            <span>SLA Standard v1.4</span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
              SECURE SESSION
            </span>
          </div>
        </div>

        {/* Right Side: Tab forms */}
        <div className="lg:col-span-7 p-6 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            
            {/* Tab selector switcher */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 border border-gray-100">
              <button
                type="button"
                id="tab-login-btn"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 ${
                  activeTab === 'login' 
                    ? 'bg-white text-blue-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Dashboard</span>
              </button>
              <button
                type="button"
                id="tab-register-btn"
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 ${
                  activeTab === 'register' 
                    ? 'bg-white text-blue-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Tim Baru</span>
              </button>
            </div>

            {/* TAB CONTENT: LOGIN */}
            {activeTab === 'login' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-[#111822] tracking-tight">Selamat Datang Kembali!</h3>
                  <p className="text-xs text-gray-500 mt-1">Gunakan alamat email terdaftar dan kata sandi Anda.</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Email Kerja</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="email"
                        id="login-email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@marketops.com"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700">Kata Sandi</label>
                      <span className="text-[10px] text-gray-400 font-mono">default: password123</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        id="login-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650 transition"
                      >
                        {showLoginPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-login-btn"
                    className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition duration-150 flex items-center justify-center space-x-2 text-sm mt-6 cursor-pointer"
                  >
                    <span>Masuk ke Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* DEMO ACCOUNTS QUICK-LOGIN */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center space-x-2 mb-3.5">
                    <HelpCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-extrabold text-gray-700">Login Cepat Akun Simulasi Tim (Default Demo):</span>
                  </div>
                  
                  <div id="demo-users-shortcuts" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {users.slice(0, 5).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u)}
                        className="text-left p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6.5 h-6.5 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-[10px] font-extrabold uppercase">
                            {u.avatar}
                          </div>
                          <div className="truncate shrink-0 max-w-[130px]">
                            <span className="text-xs font-extrabold text-gray-800 block leading-tight group-hover:text-blue-900">{u.name}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">{u.role}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: REGISTER */}
            {activeTab === 'register' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-extrabold text-[#111822] tracking-tight">Daftar Anggota Tim Baru</h3>
                  <p className="text-xs text-gray-500 mt-1">Registrasikan data personil untuk menerima tugas & hak akses.</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccessMsg && (
                  <div className="p-3 bg-green-50 text-green-700 text-xs font-semibold rounded-xl border border-green-100 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full shrink-0" />
                    <span>{regSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Nama Lengkap</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="text"
                        id="register-name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Achmad Sobri"
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Email Organisasi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="email"
                        id="register-email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="sobri@marketops.com"
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs font-bold text-gray-700">Kata Sandi Akun</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        id="register-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650 transition"
                      >
                        {showRegPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Role & Department Selection layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                        Role / Jabatan
                      </label>
                      <select
                        id="register-role"
                        value={regRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      >
                        <option value="Lead Marketplace">Lead Marketplace</option>
                        <option value="Marketplace Specialist">Marketplace Specialist</option>
                        <option value="Ads Specialist">Ads Specialist</option>
                        <option value="Designer / Content">Designer / Content</option>
                        <option value="Admin / CS">Admin / CS</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        Departemen (Otomatis)
                      </label>
                      <input
                        type="text"
                        id="register-dept"
                        value={regDept}
                        readOnly
                        className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Detailed permissions indicator block based on role */}
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] leading-relaxed select-none text-blue-900">
                    <span className="font-extrabold uppercase tracking-widest block mb-1">HAK AKSES UTAMA PERAN INI:</span>
                    {regRole === 'Lead Marketplace' && (
                      <p>• Kontrol penuh seluruh Toko • Menyetujui Revisi/Selesai Tugas • Menugaskan Anggota Tim • Akses Log sistem master dan seluruh reports.</p>
                    )}
                    {regRole === 'Marketplace Specialist' && (
                      <p>• Mengelola toko & mendaftar campaign harian • Menyelesaikan Tugas Operasional • Mengoptimasi skor kelengkapan data listing produk.</p>
                    )}
                    {regRole === 'Ads Specialist' && (
                      <p>• Akses penuh Ads Tracker (ROAS, Spend, CTR) • Menyesuaikan Action status iklan harian • Melihat visual reports & grafik ads.</p>
                    )}
                    {regRole === 'Designer / Content' && (
                      <p>• Mengambil penugasan brief kreatif desain • Mengunggah link bukti desain banner • Akses eksklusif standardisasi visual SOP.</p>
                    )}
                    {regRole === 'Admin / CS' && (
                      <p>• Menangani alokasi stok retur toko • Memantau checklist logistik produk cerdas • Menyelesaikan instruksi SOP retur pelanggan.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="submit-register-btn"
                    className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition duration-150 flex items-center justify-center space-x-2 text-sm cursor-pointer"
                  >
                    <span>Daftar & Masuk Otomatis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

          <div className="text-center text-[10px] text-gray-400 select-none pt-4 border-t border-gray-50">
            <span>MarketOps Workspace. Dihubungkan dengan standar pengamanan enkripsi CSR Client-Side.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
