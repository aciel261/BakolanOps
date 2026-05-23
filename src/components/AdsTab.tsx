import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  AlertCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { AdPerformance, Store } from '../types';

interface AdsTabProps {
  ads: AdPerformance[];
  setAds: React.Dispatch<React.SetStateAction<AdPerformance[]>>;
  stores: Store[];
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
  canEdit: boolean;
}

export default function AdsTab({
  ads,
  setAds,
  stores,
  onLogActivity,
  canEdit
}: AdsTabProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMarketplace, setFilterMarketplace] = useState<string>('All');

  // Form State
  const [formData, setFormData] = useState({
    storeId: stores[0]?.id || 'store-1',
    productName: '',
    marketplace: 'Shopee' as AdPerformance['marketplace'],
    date: new Date().toISOString().split('T')[0],
    budget: 500000,
    spend: 400000,
    gmvAds: 1200000,
    ctr: 2.5,
    cpc: 500,
    conversionRate: 1.5,
    notes: '',
  });

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.name || 'Kanal Terbuka';
  };

  const filteredAds = useMemo(() => {
    return ads.filter(a => filterMarketplace === 'All' || a.marketplace === filterMarketplace);
  }, [ads, filterMarketplace]);

  // Aggregate Metrics over filtered list
  const metrics = useMemo(() => {
    if (filteredAds.length === 0) {
      return { totalSpend: 0, totalGmv: 0, avgRoas: 0, avgCtr: 0, avgCpc: 0 };
    }
    const spend = filteredAds.reduce((acc, c) => acc + c.spend, 0);
    const gmv = filteredAds.reduce((acc, c) => acc + c.gmvAds, 0);
    const roas = spend > 0 ? (gmv / spend) : 0;
    const ctrTotal = filteredAds.reduce((acc, c) => acc + c.ctr, 0) / filteredAds.length;
    const cpcTotal = filteredAds.reduce((acc, c) => acc + c.cpc, 0) / filteredAds.length;

    return {
      totalSpend: spend,
      totalGmv: gmv,
      avgRoas: Number(roas.toFixed(2)),
      avgCtr: Number(ctrTotal.toFixed(2)),
      avgCpc: Math.round(cpcTotal)
    };
  }, [filteredAds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName) return;

    // ROAS auto threshold rules in real-time (Section 7 instructions)
    const rawRoas = formData.spend > 0 ? Number((formData.gmvAds / formData.spend).toFixed(2)) : 0;
    
    let recommendation: AdPerformance['actionStatus'] = 'Optimize';
    if (rawRoas >= 3.0) {
      recommendation = 'Scale Up';
    } else if (rawRoas < 1.5) {
      recommendation = 'Stop';
    } else {
      recommendation = 'Optimize';
    }

    const newAdLog: AdPerformance = {
      id: `ads-${Date.now()}`,
      storeId: formData.storeId,
      productName: formData.productName,
      marketplace: formData.marketplace,
      date: formData.date,
      budget: Number(formData.budget),
      spend: Number(formData.spend),
      gmvAds: Number(formData.gmvAds),
      ctr: Number(formData.ctr),
      cpc: Number(formData.cpc),
      conversionRate: Number(formData.conversionRate),
      roas: rawRoas,
      actionStatus: recommendation,
      notes: formData.notes || `ROAS senilai ${rawRoas}x. Disarankan tindakan ${recommendation}.`
    };

    setAds(prev => [newAdLog, ...prev]);
    onLogActivity('Ads', 'Input Laporan Iklan', `Mencatat atribusi spend Rp ${formData.spend} pada "${formData.productName}" (ROAS: ${rawRoas}x).`);
    setIsModalOpen(false);

    // Reset Form
    setFormData({
      storeId: stores[0]?.id || 'store-1',
      productName: '',
      marketplace: 'Shopee',
      date: new Date().toISOString().split('T')[0],
      budget: 500000,
      spend: 400000,
      gmvAds: 1200000,
      ctr: 2.5,
      cpc: 500,
      conversionRate: 1.5,
      notes: '',
    });
  };

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Header sections */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pelacak Kinerja Iklan (Ads Tracker)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hitung ROI promosi digital secara presisi. Sistem menghitung rasio ROAS harian dan meluncurkan alert audit harian otomatis.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Rekam Laporan Iklan</span>
          </button>
        )}
      </div>

      {/* HIGHLIGHT ROAS KPIs GRID */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 select-none font-mono">
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider block">Akumulasi Spend</span>
          <p className="text-lg font-extrabold text-[#1E3A8A] mt-1">
            Rp {metrics.totalSpend.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider block">Atribusi Omset (GMV)</span>
          <p className="text-lg font-extrabold text-green-700 mt-1">
            Rp {metrics.totalGmv.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider block">Sintesis ROAS</span>
          <p className="text-lg font-extrabold text-indigo-800 mt-1">
            {metrics.avgRoas}x
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider block">Mean Click Rate (CTR)</span>
          <p className="text-lg font-extrabold text-gray-700 mt-1">
            {metrics.avgCtr}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider block">Rata-rata CPC</span>
          <p className="text-lg font-extrabold text-gray-700 mt-1">
            Rp {metrics.avgCpc}
          </p>
        </div>

      </div>

      {/* FILTER BUTTONS ROW */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Pilih Marketplace:</span>
          <div className="flex gap-1.5">
            {['All', 'Shopee', 'Tokopedia', 'TikTok Shop', 'Lazada'].map((e) => (
              <button
                key={e}
                onClick={() => setFilterMarketplace(e)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterMarketplace === e 
                    ? 'bg-[#1E3A8A] text-white font-bold' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {e === 'All' ? 'Semua Saluran' : e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-100 max-w-sm select-none">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-[10px] leading-relaxed">
            Formula Rekomendasi: ROAS ≥ 3x = <strong>Scale Up</strong>, ROAS &lt; 1.5x = <strong>Stop</strong>, Lainnya = <strong>Saran Optimasi</strong>.
          </p>
        </div>
      </div>

      {/* ADS PERFORMANCE SHEET TABLE REPORT */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 font-mono">
              <th className="p-4 pl-6">Tanggal & Produk Iklan</th>
              <th className="p-4">Toko Portal</th>
              <th className="p-4">Beban Saluran</th>
              <th className="p-4">Spend (Biaya)</th>
              <th className="p-4">Atribusi Sales (GMV)</th>
              <th className="p-4">CTR / CR (%)</th>
              <th className="p-4 text-center">ROAS Hasil</th>
              <th className="p-4">Rekomendasi Tindakan</th>
              <th className="p-4 pr-6">Catatan Analis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-mono">
            {filteredAds.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 font-sans">Belum ada record ads harian terdaftar.</td>
              </tr>
            ) : (
              filteredAds.map((ad) => {
                let badgeBg = 'bg-orange-100 text-orange-800'; // Shopee default
                if (ad.marketplace === 'Tokopedia') badgeBg = 'bg-green-100 text-green-800';
                if (ad.marketplace === 'TikTok Shop') badgeBg = 'bg-slate-900 text-white';
                if (ad.marketplace === 'Lazada') badgeBg = 'bg-blue-100 text-blue-800';

                let scoreColor = 'text-yellow-700 bg-yellow-50 border-yellow-200';
                if (ad.actionStatus === 'Scale Up') scoreColor = 'text-green-700 bg-green-50 border-green-200 font-bold';
                if (ad.actionStatus === 'Stop') scoreColor = 'text-red-700 bg-red-50 border-red-200 font-bold';

                return (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="p-4 pl-6 font-semibold text-gray-800 font-sans">
                      <div>
                        <p className="font-extrabold text-gray-800">{ad.productName}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{ad.date}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-sans font-medium">{getStoreName(ad.storeId)}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${badgeBg}`}>
                        {ad.marketplace}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-700">Rp {ad.spend.toLocaleString('id-ID')}</td>
                    <td className="p-4 font-bold text-green-700">Rp {ad.gmvAds.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-gray-500">
                      <div>CTR: <span className="font-bold">{ad.ctr}%</span></div>
                      <div className="text-[10px] text-gray-400 mt-0.5">CR: <span className="font-bold">{ad.conversionRate}%</span></div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-extrabold block text-indigo-900">{ad.roas}x</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] tracking-tight uppercase px-2.5 py-1 rounded-lg border ${scoreColor}`}>
                        {ad.actionStatus}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-gray-500 font-sans italic max-w-xs truncate" title={ad.notes}>
                      "{ad.notes || 'Tidak ada analisis khusus.'}"
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* REKAM ADS MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-slide-up text-gray-800">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Rekam Laporan Iklan Harian</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Nama Produk Listing Beriklan</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder="Contoh: Wardah Lightening Serum 30ml"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-sans"
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
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Saluran Platform</label>
                  <select
                    value={formData.marketplace}
                    onChange={(e) => setFormData({...formData, marketplace: e.target.value as AdPerformance['marketplace']})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="Tokopedia">Tokopedia</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                    <option value="Lazada">Lazada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tanggal Input</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Budget Harian (Rupiah)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Actual Spend (Biaya)</label>
                  <input
                    type="number"
                    value={formData.spend}
                    onChange={(e) => setFormData({...formData, spend: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Attributed Income (GMV Iklan)</label>
                  <input
                    type="number"
                    value={formData.gmvAds}
                    onChange={(e) => setFormData({...formData, gmvAds: Number(e.target.value)})}
                    placeholder="Nilai Atribusi Omset"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Cost Per Click (CPC)</label>
                  <input
                    type="number"
                    value={formData.cpc}
                    onChange={(e) => setFormData({...formData, cpc: Number(e.target.value)})}
                    placeholder="Rupiah per Click"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Click-Through Rate (CTR %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ctr}
                    onChange={(e) => setFormData({...formData, ctr: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Conversion Rate (CR %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.conversionRate}
                    onChange={(e) => setFormData({...formData, conversionRate: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Catatan Evaluasi / Rekomendasi Kreatif</label>
                <textarea
                  value={formData.notes}
                  rows={2}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Keterangan kata kunci boncos, performa visual ad, atau penyesuaian bids..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none resize-none font-sans"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition font-sans"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="p-2.5 px-5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition font-sans"
                >
                  Rekam Laporan Iklan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
