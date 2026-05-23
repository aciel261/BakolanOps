import React, { useMemo } from 'react';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  Percent, 
  TrendingUp, 
  Award,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  BellRing
} from 'lucide-react';
import { Store, Task, AdPerformance, Product } from '../types';

interface DashboardProps {
  stores: Store[];
  tasks: Task[];
  ads: AdPerformance[];
  products: Product[];
  setActiveTab: (tab: string) => void;
  currentUserRole: string;
}

export default function Dashboard({
  stores,
  tasks,
  ads,
  products,
  setActiveTab,
  currentUserRole,
}: DashboardProps) {

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== 'Done');
    const overdue = tasks.filter((t) => {
      const isPast = new Date(t.deadline) < new Date();
      return isPast && t.status !== 'Done';
    });
    const pendingReview = tasks.filter((t) => t.status === 'Need Review');
    const avgRoas = ads.length > 0 
      ? (ads.reduce((acc, curr) => acc + curr.roas, 0) / ads.length).toFixed(2)
      : '0.00';

    return {
      activeStores: stores.filter(s => s.status === 'Active').length,
      pendingTasks: activeTasks.length,
      overdueTasks: overdue.length,
      pendingReview: pendingReview.length,
      averageRoas: avgRoas,
    };
  }, [stores, tasks, ads]);

  // Critical SEO alerts filtering for products with SEO scores less than 70%
  const lowSeoProducts = useMemo(() => {
    return products.filter((p) => p.score < 70);
  }, [products]);

  // Active reviews in queue
  const pendingReviewsList = useMemo(() => {
    return tasks.filter((t) => t.status === 'Need Review').slice(0, 3);
  }, [tasks]);

  // Summarize ad performances
  const totalSpend = useMemo(() => {
    return ads.reduce((acc, cur) => acc + cur.spend, 0);
  }, [ads]);

  const totalGmvAds = useMemo(() => {
    return ads.reduce((acc, cur) => acc + cur.gmvAds, 0);
  }, [ads]);

  return (
    <div className="p-8 space-y-8 flex-1 bg-[#F8FAFC]">
      
      {/* Dynamic Greetings Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Kendali MarketOps</h1>
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse shrink-0" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Pantau kinerja operasional, kampanye, iklan harian, serta kepatuhan SOP tim dari satu layar terintegrasi.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-blue-50/50 p-2.5 px-4 rounded-xl border border-blue-100/60 shrink-0">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping" />
          <span className="text-xs font-semibold text-blue-900 font-mono">
            Mode Simulasi: {currentUserRole}
          </span>
        </div>
      </div>

      {/* KPI WIDGET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        
        {/* Active Stores Widget */}
        <div 
          onClick={() => setActiveTab('stores')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Toko Aktif</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-1.5">{stats.activeStores}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Dari total {stores.length} toko terdaftar</p>
          </div>
        </div>

        {/* Pending Tasks Widget */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-amber-200 hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Tugas Aktif</p>
            <p className="text-2xl font-extrabold text-amber-900 mt-1.5">{stats.pendingTasks}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stats.pendingReview} tugas menunggu penilaian</p>
          </div>
        </div>

        {/* Overdue Warnings Widget */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-red-200 hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Tenggat Lewat</p>
            <p className={`text-2xl font-extrabold mt-1.5 ${stats.overdueTasks > 0 ? 'text-red-600 font-mono' : 'text-gray-700'}`}>
              {stats.overdueTasks}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Tugas memerlukan tindakan cepat</p>
          </div>
        </div>

        {/* Average ROAS Aggregates Widget */}
        <div 
          onClick={() => setActiveTab('ads')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-green-200 hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Rata-rata ROAS</p>
            <p className="text-2xl font-extrabold text-green-700 font-mono mt-1.5">{stats.averageRoas}x</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Pendapatan ads dibagi budget</p>
          </div>
        </div>

      </div>

      {/* CHARTS & REVIEWS BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GMV Capaian Trend Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Tren Pencapaian Target GMV Mingguan
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Tingkat kontribusi gabungan seluruh marketplace panel</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Aktual Vs Target</span>
            </div>
          </div>
          
          {/* SVG Highly Polished Vector Graph */}
          <div className="relative pt-4">
            <div className="h-56 w-full border-b border-l border-gray-200 relative flex items-end">
              
              {/* Grid Lines Horizontal */}
              <div className="absolute left-0 right-0 top-1/4 border-t border-gray-100 border-dashed text-[9px] text-gray-300 font-mono select-none" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-gray-100 border-dashed" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-gray-100 border-dashed" />
              
              {/* Actual Vector Line path */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Dotted Target Line representation at 60% */}
                <line x1="0" y1="40" x2="100" y2="40" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Area under curve */}
                <path d="M 0 90 L 25 75 L 50 48 L 75 35 L 100 12 L 100 100 L 0 100 Z" fill="url(#areaGradient)" />
                
                {/* Curve line */}
                <path d="M 0 90 L 25 75 L 50 48 L 75 35 L 100 12" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Point nodes */}
                <circle cx="25" cy="75" r="4" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="50" cy="48" r="4" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="75" cy="35" r="4" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="100" cy="12" r="4" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>

              {/* Weekly text tags on x-axis */}
              <div className="absolute left-0 right-0 bottom-[-24px] grid grid-cols-4 text-center text-[10px] text-gray-400 font-mono font-semibold pt-1">
                <span>M-1 (Real:  Indonesia)</span>
                <span>M-2 (Toko Baru)</span>
                <span>M-3 (Campaign WIB)</span>
                <span>M-4 (6.6 SBD)</span>
              </div>

              {/* Metric tags */}
              <div className="absolute top-1/2 left-2 text-[9px] text-gray-400 font-mono font-semibold">Rp 350Juta</div>
              <div className="absolute top-4 right-2 text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono shadow-xs">
                Capaian: 108% Target
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center pt-8">
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-sans font-bold">Total Target GMV</p>
              <p className="text-sm font-extrabold text-gray-700 mt-1">Rp 1,28 Miliar</p>
            </div>
            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/40">
              <p className="text-[10px] text-blue-700 uppercase font-sans font-bold">Iklan Terbelanjakan</p>
              <p className="text-sm font-extrabold text-blue-950 mt-1">Rp {totalSpend.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-green-50/50 p-2.5 rounded-lg border border-green-100/40">
              <p className="text-[10px] text-green-700 uppercase font-sans font-bold">Atribusi Iklan (GMV)</p>
              <p className="text-sm font-extrabold text-green-950 mt-1">Rp {totalGmvAds.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Automatic Insights Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-[18px] h-[18px] text-indigo-600" /> Rekomendasi Iklan Otomatis
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">INTELLIGENCE</span>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Kalkulasi rasio pengembalian modal iklan berdasarkan ambang batas ROAS Indonesia (High-Fidelity):
            </p>

            <div className="space-y-3 mt-4 overflow-y-auto max-h-72 pr-1">
              {ads.map((ad, idx) => {
                let statusColor = 'bg-yellow-50 text-yellow-800 border-yellow-200';
                if (ad.actionStatus === 'Scale Up') statusColor = 'bg-green-50 text-green-800 border-green-200';
                if (ad.actionStatus === 'Stop') statusColor = 'bg-red-50 text-red-800 border-red-200';

                return (
                  <div key={ad.id || idx} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-2 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xs text-gray-800 truncate max-w-[140px]">{ad.productName}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{ad.marketplace} · ROAS: <strong className="text-gray-700">{ad.roas}x</strong></p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                        {ad.actionStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 italic bg-white/70 p-1.5 rounded border border-gray-50">
                      "{ad.notes}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('ads')}
            className="w-full flex items-center justify-center space-x-2 p-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 hover:text-blue-900 transition mt-4"
          >
            <span>Buka Analitik Iklan Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* DASHBOARD BOTTOM GRID: PENDING REVIEWS + LOW SEO WARNINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PENDING REVIEWS GROUP */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <BellRing className="w-[18px] h-[18px] text-amber-600" /> Antrean Tugas Menunggu Review ({pendingReviewsList.length})
            </h3>
            <button 
              onClick={() => setActiveTab('approvals')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Ulas Semua
            </button>
          </div>

          <div className="space-y-3.5">
            {pendingReviewsList.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                Semua peninjauan selesai. Kerja bagus tim!
              </div>
            ) : (
              pendingReviewsList.map((t) => (
                <div 
                  key={t.id} 
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:border-blue-100 transition"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <p className="font-semibold text-xs text-gray-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-gray-400">
                      Pembuat: Staff Terkait · Jatuh Tempo: <span className="font-mono">{t.deadline}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('approvals')}
                    className="p-1.5 px-3 bg-blue-600 font-bold text-[10px] text-white rounded-md hover:bg-blue-700 transition shrink-0"
                  >
                    Buka
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CRITICAL CATALOG SEO WARNINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-[18px] h-[18px] text-red-600" /> Peringatan Skor Optimasi SEO Rendah ({lowSeoProducts.length})
            </h3>
            <button 
              onClick={() => setActiveTab('products')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Lihat Katalog
            </button>
          </div>

          <div className="space-y-3.5">
            {lowSeoProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                Tidak ada alert SEO. Semua produk berada di atas margin kualitas 70%.
              </div>
            ) : (
              lowSeoProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="p-3 border border-red-100 bg-red-50/20 rounded-xl flex items-center justify-between hover:bg-red-50/40 transition"
                >
                  <div className="space-y-1 min-w-0 pr-1.5">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-[13px] text-gray-800 truncate">{p.name}</p>
                      <span className="text-[8px] bg-red-600 text-white font-extrabold px-1 rounded uppercase tracking-tighter">SEO ALERT</span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">SKU: <span className="font-mono">{p.sku}</span> · catatan: {p.notes}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 p-1 px-2.5 rounded-lg">
                      {p.score}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
