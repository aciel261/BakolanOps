import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  Filter, 
  User, 
  TrendingUp, 
  FileText,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Store, User as AppUser } from '../types';

interface StoresTabProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  users: AppUser[];
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
  canEdit: boolean;
  currentUserRole?: string;
}

export default function StoresTab({
  stores,
  setStores,
  users,
  onLogActivity,
  canEdit,
  currentUserRole
}: StoresTabProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMarketplace, setFilterMarketplace] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New Store State Initialiser
  const [formData, setFormData] = useState({
    name: '',
    marketplace: 'Shopee' as Store['marketplace'],
    brand: '',
    picId: 'usr-2',
    url: '',
    category: '',
    targetGmv: 150000000,
    status: 'Active' as Store['status'],
    notes: '',
  });

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchMkt = filterMarketplace === 'All' || s.marketplace === filterMarketplace;
      const matchStat = filterStatus === 'All' || s.status === filterStatus;
      return matchMkt && matchStat;
    });
  }, [stores, filterMarketplace, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand) return;

    const newStoreItem: Store = {
      id: `store-${Date.now()}`,
      name: formData.name,
      marketplace: formData.marketplace,
      brand: formData.brand,
      picId: formData.picId,
      url: formData.url || '#',
      category: formData.category || 'General',
      targetGmv: Number(formData.targetGmv),
      status: formData.status,
      notes: formData.notes,
    };

    setStores((prev) => [...prev, newStoreItem]);
    onLogActivity('Store', 'Registrasi Toko Baru', `Pendaftaran kanal target baru "${formData.name}" berhasil.`);
    setIsModalOpen(false);
    
    // Reset Form
    setFormData({
      name: '',
      marketplace: 'Shopee',
      brand: '',
      picId: 'usr-2',
      url: '',
      category: '',
      targetGmv: 150000000,
      status: 'Active',
      notes: '',
    });
  };

  const getUserName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Tidak Ada PIC';
  };

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Upper header action section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Katalog Toko Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau dan kelola seluruh kanal penjualan marketplace resmi brand yang sedang dipegang oleh tim operasional Anda.
          </p>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Toko Baru</span>
          </button>
        )}
      </div>

      {/* FILTURAL SECTION */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filter Marketplace:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All', 'Shopee', 'Tokopedia', 'TikTok Shop', 'Lazada'].map((mkt) => (
              <button
                key={mkt}
                onClick={() => setFilterMarketplace(mkt)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterMarketplace === mkt 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {mkt === 'All' ? 'Semua' : mkt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg p-1.5 px-3 select-none outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">Semua Keadaan</option>
            <option value="Active">Aktif</option>
            <option value="Maintenance">Pemeliharaan (Maintenance)</option>
            <option value="Inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* CARDS LISTING GRID */}
      {filteredStores.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Tidak ada toko yang cocok dengan filter aktif Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => {
            let badgeBg = 'bg-orange-100 text-orange-800'; // Shopee default
            if (store.marketplace === 'Tokopedia') badgeBg = 'bg-green-100 text-green-800';
            if (store.marketplace === 'TikTok Shop') badgeBg = 'bg-slate-900 text-white';
            if (store.marketplace === 'Lazada') badgeBg = 'bg-blue-100 text-blue-800 animate-pulse';

            let statusColor = 'bg-green-100 text-green-800';
            if (store.status === 'Maintenance') statusColor = 'bg-yellow-100 text-yellow-800';
            if (store.status === 'Inactive') statusColor = 'bg-red-100 text-red-800';

            return (
              <div 
                key={store.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-xs ${badgeBg}`}>
                      {store.marketplace}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                      • {store.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-gray-800 tracking-tight">{store.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Brand Utama: <strong className="text-gray-500 uppercase">{store.brand}</strong></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-xs border-t border-gray-50 pb-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-wider">Target GMV</p>
                      <p className="text-sm font-extrabold text-blue-950 mt-0.5">
                        Rp {store.targetGmv.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-wider font-semibold">Kategori</p>
                      <p className="text-xs text-gray-700 font-sans font-semibold truncate mt-1">
                        {store.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="font-bold text-[10px] text-gray-400 uppercase font-sans tracking-tight mb-1">Catatan Operasional:</p>
                    "{store.notes || 'Tidak ada catatan tambahan.'}"
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-gray-500">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium truncate max-w-[120px]">
                      PIC: {getUserName(store.picId)}
                    </span>
                  </div>

                  {store.url && store.url !== '#' && (
                    <a 
                      href={store.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-bold tracking-tight hover:underline text-[11px]"
                    >
                      <span>Seller Center</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Secure delete only for Lead Marketplace */}
                {currentUserRole === 'Lead Marketplace' && (
                  <div className="pt-3 border-t border-gray-100 mt-2 select-none">
                    {confirmDeleteId === store.id ? (
                      <div className="flex items-center justify-between bg-red-50 p-2 rounded-xl border border-red-150 animate-fade-in">
                        <span className="text-[10px] text-red-700 font-extrabold uppercase">Hapus Toko ini?</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setStores(prev => prev.filter(s => s.id !== store.id));
                              onLogActivity('Store', 'Hapus Toko', `Menghapus toko marketplace "${store.name}" (Kanal: ${store.marketplace}) dari list.`);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-2 py-1 rounded-md transition"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold text-[9px] px-2 py-1 rounded-md border border-gray-200 transition bg-white"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(store.id)}
                          className="text-[9px] text-red-600 hover:text-white hover:bg-red-600 font-extrabold uppercase px-2.5 py-1 rounded-md border border-red-200 hover:border-red-650 transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Toko</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTRATION MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Pendaftaran Target Toko Marketplace</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Nama Toko Marketplace</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Wardah Official Tokopedia"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Saluran E-Commerce</label>
                  <select
                    value={formData.marketplace}
                    onChange={(e) => setFormData({...formData, marketplace: e.target.value as Store['marketplace']})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="Tokopedia">Tokopedia</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                    <option value="Lazada">Lazada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Brand Terkait</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="Contoh: Wardah, Samsung, Eiger"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Kategori Produk</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Contoh: Beauty, Fashion, Electronic"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">URL Seller Center / Link Toko</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://shopee.co.id/..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Target GMV Bulanan (Rupiah)</label>
                  <input
                    type="number"
                    value={formData.targetGmv}
                    onChange={(e) => setFormData({...formData, targetGmv: Number(e.target.value)})}
                    placeholder="150000000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Atur PIC / Penanggung Jawab</label>
                  <select
                    value={formData.picId}
                    onChange={(e) => setFormData({...formData, picId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Status Toko</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Store['status']})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    <option value="Active">Aktif</option>
                    <option value="Maintenance">Pemeliharaan</option>
                    <option value="Inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Deskripsi / Catatan Tambahan</label>
                <textarea
                  value={formData.notes}
                  rows={2}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Kebutuhan khusus, kendala atau KPI..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Daftarkan Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
