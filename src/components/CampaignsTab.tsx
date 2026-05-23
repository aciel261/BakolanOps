import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckSquare, 
  TrendingUp, 
  DollarSign, 
  User, 
  Loader2, 
  ChevronRight,
  Sparkles,
  Trophy,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Campaign, Store, User as AppUser, ChecklistItem } from '../types';

interface CampaignsTabProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  stores: Store[];
  users: AppUser[];
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
  canEdit: boolean;
  currentUserRole?: string;
}

export default function CampaignsTab({
  campaigns,
  setCampaigns,
  stores,
  users,
  onLogActivity,
  canEdit,
  currentUserRole
}: CampaignsTabProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Stats input state for recording actual performance values
  const [actualGmvInput, setActualGmvInput] = useState<string>('');
  const [actualOrdersInput, setActualOrdersInput] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    storeId: stores[0]?.id || 'store-1',
    type: 'Double Date' as Campaign['type'],
    objective: '',
    startDate: '',
    endDate: '',
    targetGmv: 150000000,
    budget: 15000000,
    picId: 'usr-2',
  });

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.name || 'Kanal Terbuka';
  };

  const getUserName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Tidak Ada PIC';
  };

  // Submit New Campaign Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.objective) return;

    // Checklist presets based on Campaign types (Section 7 instructions)
    let autoChecklist: ChecklistItem[] = [];
    if (formData.type === 'Flash Sale') {
      autoChecklist = [
        { text: 'Pilih produk margin tinggi', done: false },
        { text: 'Setting diskon di seller center', done: false },
        { text: 'Pastikan stok siap kirim', done: false },
      ];
    } else if (formData.type === 'Double Date') {
      autoChecklist = [
        { text: 'Daftar campaign besar platform', done: false },
        { text: 'Dekorasi banner bertema promo', done: false },
        { text: 'Optimasi kata kunci pencarian toko', done: false },
        { text: 'Set up voucher cashback', done: false },
      ];
    } else { // Payday
      autoChecklist = [
        { text: 'Ganti thumbnail produk diskon', done: false },
        { text: 'Kirim broadcast chat', done: false },
        { text: 'Rilis live stream terjadwal', done: false },
      ];
    }

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: formData.name,
      storeId: formData.storeId,
      type: formData.type,
      objective: formData.objective,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date().toISOString().split('T')[0],
      targetGmv: Number(formData.targetGmv),
      picId: formData.picId,
      budget: Number(formData.budget),
      status: 'Draft',
      actualGmv: 0,
      actualOrders: 0,
      checklist: autoChecklist
    };

    setCampaigns(prev => [...prev, newCamp]);
    onLogActivity('Campaign', 'Buat Campaign Planner', `Memperkenalkan agenda promosi "${formData.name}" (Auto-SOP checklist ${autoChecklist.length} item).`);
    setIsModalOpen(false);
    
    // Reset Form
    setFormData({
      name: '',
      storeId: stores[0]?.id || 'store-1',
      type: 'Double Date',
      objective: '',
      startDate: '',
      endDate: '',
      targetGmv: 150000000,
      budget: 15000000,
      picId: 'usr-2',
    });
  };

  // Check off Campaign Checklist item
  const handleToggleChecklist = (campId: string, idx: number) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campId) {
        const updatedChecklist = c.checklist.map((item, index) => 
          index === idx ? { ...item, done: !item.done } : item
        );
        const campUpdated = { ...c, checklist: updatedChecklist };
        if (selectedCampaign?.id === campId) {
          setSelectedCampaign(campUpdated);
        }
        return campUpdated;
      }
      return c;
    }));
  };

  // Finalize stats (Mark finish & enter values)
  const handleFinalizeCampaign = (campId: string) => {
    const rawGmv = Number(actualGmvInput);
    const rawOrders = Number(actualOrdersInput);
    if (isNaN(rawGmv) || isNaN(rawOrders)) return;

    setCampaigns(prev => prev.map(c => {
      if (c.id === campId) {
        const campUpdated: Campaign = {
          ...c,
          status: 'Finished',
          actualGmv: rawGmv,
          actualOrders: rawOrders
        };
        if (selectedCampaign?.id === campId) {
          setSelectedCampaign(campUpdated);
        }
        return campUpdated;
      }
      return c;
    }));

    onLogActivity('Campaign', 'Sertifikasi Hasil Campaign', `Finis promosi ID ${campId}. Hasil aktual: Rp ${rawGmv.toLocaleString('id-ID')} (${rawOrders} order).`);
    
    // Clear state inputs
    setActualGmvInput('');
    setActualOrdersInput('');
  };

  // Launch transition Draft -> Running
  const handleLaunchCampaign = (campId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campId) {
        const campUpdated: Campaign = { ...c, status: 'Running' };
        if (selectedCampaign?.id === campId) {
          setSelectedCampaign(campUpdated);
        }
        return campUpdated;
      }
      return c;
    }));
    onLogActivity('Campaign', 'Mulai Live Campaign', `Meluncurkan program promosi harian untuk Campaign ID ${campId}.`);
  };

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Upper action headers */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Perencana Kalender Kampanye</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gagas promo musiman e-commerce, kembangkan checklist SOP otomatis, dan bandingkan raihan GMV terhadap modal keluar.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Rilis Acara Promo</span>
          </button>
        )}
      </div>

      {/* CAMPAIGNS CONTAINER BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Campaigns List Side column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Daftar Acara Campaign</h3>
          
          <div className="space-y-4">
            {campaigns.map((camp) => {
              const checkedItems = camp.checklist.filter(item => item.done).length;
              const totalItems = camp.checklist.length;
              const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

              let typeColor = 'bg-orange-50 text-orange-700 border-orange-100';
              if (camp.type === 'Flash Sale') typeColor = 'bg-amber-50 text-amber-700 border-amber-100';
              if (camp.type === 'Payday') typeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';

              let statusColor = 'bg-gray-100 text-gray-700 border-gray-200';
              if (camp.status === 'Running') statusColor = 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
              if (camp.status === 'Finished') statusColor = 'bg-green-100 text-green-800 border-green-200';

              const isSelected = selectedCampaign?.id === camp.id;

              return (
                <div
                  key={camp.id}
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setActualGmvInput('');
                    setActualOrdersInput('');
                  }}
                  className={`p-5 rounded-2xl bg-white border cursor-pointer transition duration-150 space-y-4 hover:border-blue-400 hover:shadow-sm ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${typeColor}`}>
                      {camp.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      • {camp.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 text-sm tracking-tight">{camp.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-1">Marketplace: {getStoreName(camp.storeId)}</p>
                  </div>

                  {/* Progressive visual percentage check */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono font-bold">
                      <span>Protokol SOP Campaign</span>
                      <span>{checkedItems}/{totalItems} ({progressPercent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Target GMV tracker display */}
                  <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-gray-50">
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans uppercase font-bold tracking-wider block">Target Output</span>
                      <strong className="text-gray-700">Rp {camp.targetGmv.toLocaleString('id-ID')}</strong>
                    </div>
                    {camp.status === 'Finished' && (
                      <div className="text-right">
                        <span className="text-[9px] text-green-600 font-sans uppercase font-bold tracking-wider block">Aktual Capaian</span>
                        <strong className="text-green-700">Rp {camp.actualGmv.toLocaleString('id-ID')}</strong>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Inspection sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Lembar Penilaian & SOP</h3>

          {selectedCampaign ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-xs select-none">
              
              <div className="border-b border-gray-50 pb-4">
                <span className="text-[10px] font-bold text-blue-600 font-mono">DIPILIH: AGENDA KAMPANYE</span>
                <h4 className="text-base font-bold text-gray-800 tracking-tight mt-1">{selectedCampaign.name}</h4>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  SLA Masa Kerja: {selectedCampaign.startDate} s/d {selectedCampaign.endDate}
                </p>
              </div>

              {/* Goal Objective */}
              <div className="space-y-1.5 text-xs text-gray-500">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Tujuan Utama (Objective):</span>
                <p className="p-3 bg-gray-50 rounded-xl italic font-medium leading-relaxed border border-gray-100 text-gray-700">
                  "{selectedCampaign.objective}"
                </p>
              </div>

              {/* Autogenerated Checklist Workgroup */}
              <div className="space-y-3">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                  Checklist Kesiapan Teknis Promosi (Instruksi Sistem)
                </span>
                
                <div className="space-y-2">
                  {selectedCampaign.checklist.map((item, idx) => (
                    <label 
                      key={idx}
                      className="flex items-center space-x-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklist(selectedCampaign.id, idx)}
                        className="h-3.5 w-3.5 text-blue-600 border-gray-200 rounded cursor-pointer"
                      />
                      <span className={`text-xs ${item.done ? 'line-through text-gray-400' : 'text-gray-700 font-semibold'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* METRIC CARD PREVIEWS */}
              <table className="w-full text-xs font-mono border-t border-gray-100 pt-4">
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400 font-sans uppercase font-bold tracking-tight">Anggaran Iklan (Budget)</td>
                    <td className="py-2.5 text-right font-bold text-gray-700">Rp {selectedCampaign.budget.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400 font-sans uppercase font-bold tracking-tight">Penanggung Jawab (PIC)</td>
                    <td className="py-2.5 text-right font-bold text-gray-700">{getUserName(selectedCampaign.picId)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Actions panels depending on status */}
              <div className="pt-4 border-t border-gray-50 space-y-3.5">
                {selectedCampaign.status === 'Draft' && (
                  <button
                    onClick={() => handleLaunchCampaign(selectedCampaign.id)}
                    className="w-full text-center p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    Luncurkan Kampanye (Live)
                  </button>
                )}

                {selectedCampaign.status === 'Running' && (
                  <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-3">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> Hubungkan Pendapatan Aktual Kampanye
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase font-sans">Aktual GMV (IDR)</span>
                        <input
                          type="number"
                          value={actualGmvInput}
                          onChange={(e) => setActualGmvInput(e.target.value)}
                          placeholder="Nilai Rupiah"
                          className="w-full bg-white p-2 border border-gray-200 rounded-lg text-xs font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase font-sans">Total Transaksi</span>
                        <input
                          type="number"
                          value={actualOrdersInput}
                          onChange={(e) => setActualOrdersInput(e.target.value)}
                          placeholder="Jumlah"
                          className="w-full bg-white p-2 border border-gray-200 rounded-lg text-xs font-mono outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleFinalizeCampaign(selectedCampaign.id)}
                      className="w-full text-center p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Kunci & Selesaikan Kampanye
                    </button>
                  </div>
                )}

                {selectedCampaign.status === 'Finished' && (
                  <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200 space-y-1.5 select-none">
                    <Sparkles className="w-6 h-6 text-green-600 mx-auto" />
                    <p className="text-xs font-extrabold text-green-900">Kampanye Selesai Sempurna</p>
                    <p className="text-[10px] text-green-700 font-mono">
                      Efisiensi Target: {Math.round((selectedCampaign.actualGmv / selectedCampaign.targetGmv) * 100)}% Capaian
                    </p>
                  </div>
                )}
              </div>

              {/* Secure danger zone deleting campaigns only for Lead Marketplace */}
              {currentUserRole === 'Lead Marketplace' && (
                <div className="pt-4 mt-6 border-t border-red-100 bg-red-50/20 p-4 rounded-xl space-y-2 select-none animate-fade-in">
                  <p className="text-[10px] text-red-800 font-extrabold uppercase tracking-wider">Zona Bahaya (Lead Only)</p>
                  {confirmDeleteId === selectedCampaign.id ? (
                    <div className="flex items-center justify-between bg-red-55 p-2 rounded-xl border border-red-150 animate-fade-in">
                      <span className="text-[10px] text-red-900 font-extrabold">Hapus program promo ini?</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
                            onLogActivity('Campaign', 'Hapus Campaign', `Menghapus perencanaan kampanye promo "${selectedCampaign.name}" (ID: ${selectedCampaign.id}).`);
                            setSelectedCampaign(null);
                            setConfirmDeleteId(null);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg transition"
                        >
                          Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg transition"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(selectedCampaign.id)}
                      className="w-full bg-red-55 hover:bg-red-100/80 text-red-600 border border-red-200 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Hapus Program Kampanye</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200 space-y-2 select-none">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-400">Pilih salah satu campaign untuk meninjau SOP dan checklist.</p>
            </div>
          )}
        </div>

      </div>

      {/* Rilis Campaign Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Perencanaan Kampanye Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Nama Kegiatan Promo (Campaign)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Tokopedia Guncang 6.6 Brand Day"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none"
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
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tipe Desain Promo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Campaign['type']})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                  >
                    <option value="Double Date">Double Date Promo (e.g. 5.5, 6.6)</option>
                    <option value="Flash Sale">Flash Sale Terjadwal</option>
                    <option value="Payday">Payday Gajian Promo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Uraian Target Utama (Objective)</label>
                <textarea
                  required
                  value={formData.objective}
                  rows={2}
                  onChange={(e) => setFormData({...formData, objective: e.target.value})}
                  placeholder="Contoh: Mendorong penjualan hero SKU hingga 500 pcs untuk mencatatkan rekor harian..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tanggal Berakhir</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Estimasi Target GMV (Rupiah)</label>
                  <input
                    type="number"
                    value={formData.targetGmv}
                    onChange={(e) => setFormData({...formData, targetGmv: Number(e.target.value)})}
                    placeholder="150000000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Anggaran Promo/Voucher (Budget)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                    placeholder="15000000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Penanggung Jawab Camp (PIC)</label>
                <select
                  value={formData.picId}
                  onChange={(e) => setFormData({...formData, picId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-blue-600 cursor-pointer outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
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
                  Daftarkan Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
