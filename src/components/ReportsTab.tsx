import React, { useState, useMemo } from 'react';
import { 
  FileBarChart, 
  ChevronRight, 
  Download, 
  Eye, 
  RefreshCw, 
  Info,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
  Award
} from 'lucide-react';
import { Store, Campaign, AdPerformance, Task } from '../types';

interface ReportsTabProps {
  stores: Store[];
  campaigns: Campaign[];
  ads: AdPerformance[];
  tasks: Task[];
  onLogActivity: (type: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System', action: string, details: string) => void;
}

export default function ReportsTab({
  stores,
  campaigns,
  ads,
  tasks,
  onLogActivity
}: ReportsTabProps) {
  
  const [selectedStoreId, setSelectedStoreId] = useState<string>('All');
  const [reportType, setReportType] = useState<'campaign' | 'ads' | 'tasks'>('campaign');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string>('');

  const currentStoreName = useMemo(() => {
    return selectedStoreId === 'All' ? 'Seluruh Toko Gabungan' : stores.find(s => s.id === selectedStoreId)?.name || '';
  }, [selectedStoreId, stores]);

  const handleSimulateExport = (format: 'CSV' | 'PDF') => {
    setShowToast(`Mengekspor laporan ${reportType.toUpperCase()} (${format}) ke direktori unduhan...`);
    onLogActivity('System', 'Ekspor Laporan', `Ekspor laporan ${reportType.toUpperCase()} berkas ${format} untuk "${currentStoreName}".`);
    
    setTimeout(() => {
      setShowToast('');
    }, 4000);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onLogActivity('System', 'Generasi Laporan', `Menyusun dashboard laporan ${reportType.toUpperCase()} untuk "${currentStoreName}".`);
    }, 800);
  };

  // Compile specific reports datasets
  const reportData = useMemo(() => {
    if (reportType === 'campaign') {
      const storeCampaigns = campaigns.filter(c => selectedStoreId === 'All' || c.storeId === selectedStoreId);
      const totalPlanned = storeCampaigns.length;
      const totalFinished = storeCampaigns.filter(c => c.status === 'Finished').length;
      const totalBudget = storeCampaigns.reduce((acc, c) => acc + c.budget, 0);
      const targetGmv = storeCampaigns.reduce((acc, c) => acc + c.targetGmv, 0);
      const actualGmv = storeCampaigns.reduce((acc, c) => acc + c.actualGmv, 0);

      return {
        totalPlanned,
        totalFinished,
        totalBudget,
        targetGmv,
        actualGmv,
        list: storeCampaigns
      };
    } else if (reportType === 'ads') {
      const storeAds = ads.filter(a => selectedStoreId === 'All' || a.storeId === selectedStoreId);
      const totalSpend = storeAds.reduce((acc, a) => acc + a.spend, 0);
      const totalGmv = storeAds.reduce((acc, a) => acc + a.gmvAds, 0);
      const avgCtr = storeAds.length > 0 ? (storeAds.reduce((acc, a) => acc + a.ctr, 0) / storeAds.length).toFixed(1) : 0;
      const avgCPC = storeAds.length > 0 ? Math.round(storeAds.reduce((acc, a) => acc + a.cpc, 0) / storeAds.length) : 0;
      const avgRoas = totalSpend > 0 ? (totalGmv / totalSpend).toFixed(2) : '0';

      return {
        totalSpend,
        totalGmv,
        avgCtr,
        avgCPC,
        avgRoas,
        list: storeAds
      };
    } else {
      const storeTasks = tasks.filter(t => selectedStoreId === 'All' || t.storeId === selectedStoreId);
      const total = storeTasks.length;
      const completed = storeTasks.filter(t => t.status === 'Done').length;
      const inReview = storeTasks.filter(t => t.status === 'Need Review').length;
      const delayed = storeTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Done').length;

      return {
        total,
        completed,
        inReview,
        delayed,
        list: storeTasks
      };
    }
  }, [selectedStoreId, reportType, campaigns, ads, tasks]);

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Toast alert overlay */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-blue-900 border border-blue-800 text-white font-semibold text-xs py-3 px-5 rounded-xl shadow-2xl flex items-center space-x-2.5 z-50 animate-slide-up select-none">
          <FileSpreadsheet className="w-4 h-4 text-blue-300 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Generator Laporan Otomatis (Reports)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konsolidasikan seluruh raihan operasional, statistik iklan, dan kemajuan PIC menjadi sirkulasi lembar kerja siap ulas.
        </p>
      </div>

      {/* SELECTION WIDGET PANEL */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-end gap-5">
        
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider font-mono">Pilih Target Toko</span>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg p-2 px-3 outline-none"
          >
            <option value="All">Seluruh Toko Gabungan</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.marketplace})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider font-mono">Tipe Lembar Laporan</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg p-2 px-3 outline-none cursor-pointer"
          >
            <option value="campaign">Kinerja Kampanyen Promosi</option>
            <option value="ads">Optimalisasi ROI Iklan (ROAS)</option>
            <option value="tasks">Rekapitulasi Output Kinerja PIC</option>
          </select>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs p-2.5 px-5 rounded-xl transition flex items-center space-x-2 disabled:opacity-40"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Menilai Data...</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Tinjau Laporan</span>
            </>
          )}
        </button>
      </div>

      {/* GENERATED PREVIEW LAYOUT SHEET */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
        
        {/* Document Header details */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-gray-100 select-none">
          <div className="space-y-1">
            <h3 className="font-extrabold text-blue-950 text-base flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-blue-600" />
              <span>LAPORAN {reportType === 'campaign' ? 'PRESTASI KAMPANYE PROMOSI' : reportType === 'ads' ? 'AUDIT MARGIN ADVERTISEMENT' : 'METRIKS OUTPUT PIC'}</span>
            </h3>
            <p className="text-xs text-indigo-900/40 font-semibold uppercase">
              RUANG LINGKUP: {currentStoreName} · PERIODE: MEI 2026
            </p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleSimulateExport('CSV')}
              className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 border border-gray-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleSimulateExport('PDF')}
              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 border border-blue-100"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor PDF</span>
            </button>
          </div>
        </div>

        {/* Dynamic content rendering based on active report type */}
        {reportType === 'campaign' && (
          <div className="space-y-6 select-none font-sans">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Acara Direncana</span>
                <p className="text-base font-extrabold text-gray-800 mt-1">{(reportData as any).totalPlanned} Proyek</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Terselesaikan (SLA)</span>
                <p className="text-base font-extrabold text-green-700 mt-1">{(reportData as any).totalFinished} Sukses</p>
              </div>
              <div className="bg-[#1E3A8A]/5 p-4 rounded-xl border border-blue-100/40 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Total Alokasi Modal</span>
                <p className="text-base font-extrabold text-blue-950 mt-1">Rp {(reportData as any).totalBudget.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/40 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Pendapatan Atribusi</span>
                <p className="text-base font-extrabold text-green-800 mt-1">Rp {(reportData as any).actualGmv.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="p-3 pl-5">Nama Kampanye</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Anggaran</th>
                    <th className="p-3">Target GMV</th>
                    <th className="p-3">Realisasi Capaian</th>
                    <th className="p-3 pr-5 text-right">Efisiensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono">
                  {(reportData as any).list.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400 font-sans">Kosong</td>
                    </tr>
                  ) : (
                    (reportData as any).list.map((c: Campaign) => (
                      <tr key={c.id}>
                        <td className="p-3 pl-5 font-bold font-sans text-gray-800">{c.name}</td>
                        <td className="p-3 text-gray-500 font-sans">{c.type}</td>
                        <td className="p-3">Rp {c.budget.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-indigo-900">Rp {c.targetGmv.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-green-700 font-bold">Rp {c.actualGmv.toLocaleString('id-ID')}</td>
                        <td className="p-3 pr-5 text-right font-extrabold font-sans text-indigo-950">
                          {c.status === 'Finished' ? `${Math.round((c.actualGmv / c.targetGmv) * 100)}%` : 'Berjalan'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'ads' && (
          <div className="space-y-6 select-none font-sans">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Spend Terpakai</span>
                <p className="text-sm font-extrabold text-gray-800 mt-1">Rp {(reportData as any).totalSpend.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Penerimaan Atribusi</span>
                <p className="text-sm font-extrabold text-blue-950 mt-1">Rp {(reportData as any).totalGmv.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/40 font-mono">
                <span className="text-[9px] text-indigo-700 font-sans font-bold uppercase block">ROAS Gabungan</span>
                <p className="text-base font-extrabold text-indigo-900 mt-1">{(reportData as any).avgRoas}x</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">CTR Tengah</span>
                <p className="text-base font-extrabold text-gray-700 mt-1">{(reportData as any).avgCtr}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">CPC Tengah</span>
                <p className="text-base font-extrabold text-gray-700 mt-1">Rp {(reportData as any).avgCPC}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="p-3 pl-5">Nama Listing</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Spend</th>
                    <th className="p-3">Omset Atribusi</th>
                    <th className="p-3">ROAS</th>
                    <th className="p-3 pr-5 text-right">Ambang Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono">
                  {(reportData as any).list.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400 font-sans">Kosong</td>
                    </tr>
                  ) : (
                    (reportData as any).list.map((a: AdPerformance) => (
                      <tr key={a.id}>
                        <td className="p-3 pl-5 font-bold font-sans text-gray-800">{a.productName}</td>
                        <td className="p-3 text-gray-500 font-sans font-semibold">{a.marketplace}</td>
                        <td className="p-3">Rp {a.spend.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-green-700">Rp {a.gmvAds.toLocaleString('id-ID')}</td>
                        <td className="p-3 font-extrabold text-indigo-950">{a.roas}x</td>
                        <td className="p-3 pr-5 text-right font-sans font-bold uppercase text-[10px]">
                          {a.actionStatus}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'tasks' && (
          <div className="space-y-6 select-none font-sans">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Penugasan Terbit</span>
                <p className="text-base font-extrabold text-gray-800 mt-1">{(reportData as any).total} Tiket</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Done (Tuntas)</span>
                <p className="text-base font-extrabold text-green-700 mt-1">{(reportData as any).completed} Berkas</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono">
                <span className="text-[9px] text-gray-400 font-sans font-bold uppercase block">Menunggu Kelulusan</span>
                <p className="text-base font-extrabold text-amber-700 mt-1">{(reportData as any).inReview} Berkas</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 font-mono">
                <span className="text-[9px] text-red-600 font-sans font-bold uppercase block">Melebihi SLA</span>
                <p className="text-base font-extrabold text-red-700 mt-1">{(reportData as any).delayed} Tiket</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="p-3 pl-5">Rincian Tugas Kerja</th>
                    <th className="p-3">Asosiasi Store</th>
                    <th className="p-3">Prioritas</th>
                    <th className="p-3">Jatuh Tempo</th>
                    <th className="p-3 pr-5 text-right">Status Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono">
                  {(reportData as any).list.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 font-sans">Kosong</td>
                    </tr>
                  ) : (
                    (reportData as any).list.map((t: Task) => (
                      <tr key={t.id}>
                        <td className="p-3 pl-5 font-bold font-sans text-gray-800">{t.title}</td>
                        <td className="p-3 text-gray-500 font-sans">{t.storeId}</td>
                        <td className="p-3 uppercase text-[10px]">{t.priority}</td>
                        <td className="p-3 text-gray-400">{t.deadline}</td>
                        <td className="p-3 pr-5 text-right font-sans font-bold text-[10px]">
                          {t.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Informative footnote panel */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start space-x-2.5 max-w-2xl select-none">
          <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
            <strong>Catatan Audit Sistem:</strong> Seluruh laporan mematuhi format log rahasia MarketOps. Angka target dan atribusi penjualan dihitung secara berkala sesuai koordinasi penyerahan berkas operasional.
          </p>
        </div>

      </div>

    </div>
  );
}
