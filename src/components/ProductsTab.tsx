import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  CheckCircle, 
  Search, 
  Filter, 
  AlertTriangle,
  Award,
  ExternalLink,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Product, Store, ProductChecklist } from '../types';

interface ProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stores: Store[];
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
  canEdit: boolean;
  currentUserRole?: string;
}

export default function ProductsTab({
  products,
  setProducts,
  stores,
  onLogActivity,
  canEdit,
  currentUserRole
}: ProductsTabProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStoreId, setFilterStoreId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // New Product Draft Input State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    storeId: stores[0]?.id || 'store-1',
    price: 150000,
    stock: 25,
    notes: '',
  });

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.name || 'Kanal Terbuka';
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchStore = filterStoreId === 'All' || p.storeId === filterStoreId;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStore && matchSearch;
    });
  }, [products, filterStoreId, searchQuery]);

  // Handle addition of listing
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const initialCheck: ProductChecklist = {
      seoTitle: false,
      images: false,
      video: false,
      description: false,
      keyword: false,
      promo: false,
      competitivePrice: false,
      rating: false,
      stock: true, // assume stock starts registered
    };

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      storeId: formData.storeId,
      productUrl: '#',
      price: Number(formData.price),
      stock: Number(formData.stock),
      checklist: initialCheck,
      score: 11, // only 1/9 parameters is checked (stock) yielding ~11%
      notes: formData.notes || 'Belum dioptimasi.',
    };

    setProducts(prev => [...prev, newProd]);
    onLogActivity('Product', 'Tambah Listing Baru', `Mendaftarkan produk catalog baru "${formData.name}" (SKU: ${formData.sku}).`);
    setIsModalOpen(false);

    // Reset Form
    setFormData({
      name: '',
      sku: '',
      storeId: stores[0]?.id || 'store-1',
      price: 150000,
      stock: 25,
      notes: '',
    });
  };

  // Toggle checklist item and update optimized score (each checklist item counts 1/9 towards 100%)
  const handleToggleSeoParam = (prodId: string, paramKey: keyof ProductChecklist) => {
    setProducts(prev => prev.map(p => {
      if (p.id === prodId) {
        const updatedChecklist = {
          ...p.checklist,
          [paramKey]: !p.checklist[paramKey]
        };

        // Recalculate percent score
        const totalParams = Object.keys(updatedChecklist).length; // should be 9
        const checkedCount = Object.values(updatedChecklist).filter(Boolean).length;
        const newScore = Math.round((checkedCount / totalParams) * 100);

        onLogActivity('Product', 'Update SEO Checklist', `Update parameter SEO [${paramKey}] pada produk ${p.name} (Skor Baru: ${newScore}%).`);

        return {
          ...p,
          checklist: updatedChecklist,
          score: newScore,
          notes: newScore === 100 ? 'Optimasi konten listing selesai sempurna.' : p.notes
        };
      }
      return p;
    }));
  };

  const seoLabels: { key: keyof ProductChecklist; label: string }[] = [
    { key: 'seoTitle', label: 'Judul SEO (Formula)' },
    { key: 'images', label: 'Foto Produk Studio' },
    { key: 'video', label: 'Video Demonstrasi' },
    { key: 'description', label: 'Uraian Spek Lengkap' },
    { key: 'keyword', label: 'Riset Tag Kata Kunci' },
    { key: 'promo', label: 'Koneksi Diskon Promo' },
    { key: 'competitivePrice', label: 'Metode Harga Kompetitif' },
    { key: 'rating', label: 'Skor Ulasan Pembeli' },
    { key: 'stock', label: 'Ketersediaan Stok' },
  ];

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Top action sections */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Katalog Optimasi SEO Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ukur indeks kualitas konten dan kesiapan konversi (SEO Score) seluruh detail listing produk Anda untuk memicu traffic alami.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan SKU Baru</span>
          </button>
        )}
      </div>

      {/* SEARCH AND COMB FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-85 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama produk atau kode SKU..."
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

      {/* CATALOG CARD MATRIX LIST */}
      <div className="space-y-6 select-none">
        
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200 space-y-2">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-500">Katalog listing produk kosong atau tidak sesuai filter.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowScore = p.score < 70;
            const progressColor = isLowScore ? 'bg-red-600' : 'bg-green-600';

            return (
              <div 
                key={p.id} 
                className={`p-6 bg-white rounded-2xl border transition hover:shadow-md ${
                  isLowScore ? 'border-red-100' : 'border-gray-100'
                }`}
              >
                
                {/* Header Information */}
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-4 border-b border-gray-50">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <h3 className="font-extrabold text-[#1E3A8A] text-base tracking-tight">{p.name}</h3>
                      <span className="bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        SKU: {p.sku}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Marketplace: <strong className="text-gray-600">{getStoreName(p.storeId)}</strong> · Nominal: Rp {p.price.toLocaleString('id-ID')} · Stok: {p.stock}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Skor Kepatuhan SEO</span>
                      <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                        <p className={`text-xl font-mono font-extrabold ${isLowScore ? 'text-red-600' : 'text-green-700'}`}>
                          {p.score}%
                        </p>
                        {isLowScore && (
                          <span className="text-[8px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            BUTUH OPTIMASI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist parameters toggle grid */}
                <div className="py-5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2.5">
                    Evaluasi 9 Pilar Optimasi Audit Listing (Klik Kotak untuk Menyelesaikan Parameter):
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    {seoLabels.map((lbl) => {
                      const isChecked = p.checklist[lbl.key];
                      return (
                        <div
                          key={lbl.key}
                          onClick={() => handleToggleSeoParam(p.id, lbl.key)}
                          className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition select-none ${
                            isChecked 
                              ? 'bg-green-50/70 border-green-200 text-green-950 hover:bg-green-50' 
                              : 'bg-gray-50/75 border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <CheckCircle className={`w-[15px] h-[15px] shrink-0 ${isChecked ? 'text-green-600' : 'text-gray-300'}`} />
                          <span className={`text-[11px] font-semibold truncate ${isChecked ? 'font-bold' : ''}`}>
                            {lbl.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alert Warning Text Block */}
                <div className="pt-4 border-t border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 max-w-xl">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${isLowScore ? 'text-red-600' : 'text-green-600'}`} />
                    <p className="italic">
                      "<strong>Catatan Tim:</strong> {p.notes || 'Listing berada dalam kondisi optimal.'}"
                    </p>
                  </div>

                  {currentUserRole === 'Lead Marketplace' && (
                    <div className="shrink-0 select-none">
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center space-x-1.5 bg-red-50 p-2 rounded-xl border border-red-150 animate-fade-in text-xs font-mono">
                          <span className="text-[10px] text-red-700 font-extrabold uppercase">Hapus SKU?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProducts(prev => prev.filter(item => item.id !== p.id));
                              onLogActivity('Product', 'Hapus Produk', `Menghapus penayangan produk katalog "${p.name}" (SKU: ${p.sku}).`);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-2 py-1 rounded-md transition"
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-white hover:bg-gray-100 text-gray-605 font-extrabold text-[9px] px-2 py-1 rounded-md border border-gray-200 transition"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="text-[10px] text-red-600 hover:text-white hover:bg-red-600 font-extrabold uppercase px-2.5 py-1 rounded-md border border-red-200 hover:border-red-650 transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus SKU</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}

      </div>

      {/* Rilis Product Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-slide-up text-gray-800">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Registrasi Listing SKU Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Nama Produk Katalog</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Eiger Backpack Wanderlust 35 Liter"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Kode SKU (Produk Kunci)</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="Contoh: EGR-WLB-35L"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Harga Jual (Rupiah)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Jumlah Stok Terdaftar</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Catatan Catatan Optimasi / Masalah Kualitas</label>
                <textarea
                  value={formData.notes}
                  rows={2}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Seo belum lengkap, membutuhkan riset kata kunci dan video demo."
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
                  Daftarkan SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
