import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Filter, 
  FileText,
  Bookmark,
  ChevronRight,
  Info,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { SOP } from '../types';

interface SopsTabProps {
  sops: SOP[];
}

export default function SopsTab({
  sops
}: SopsTabProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [reviewSop, setReviewSop] = useState<SOP | null>(null);

  const filteredSops = sops.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 space-y-6 flex-1 bg-[#F8FAFC]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Perpustakaan SOP & Kebijakan Toko</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pusat standardisasi operasional e-commerce. Seluruh tugas terbit dikoneksikan langsung dengan panduan teknis yang ada di sini.
        </p>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        
        <div className="relative w-full md:w-85 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci panduan SOP..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 pl-10 focus:ring-1 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono shrink-0">Divisi:</span>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Campaign', 'Design Brief', 'CS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {cat === 'All' ? 'Semua Divisi' : cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* SOP CARD LIST REPRESENTATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {filteredSops.map((sop) => {
          let catColor = 'bg-blue-100 text-blue-800';
          if (sop.category === 'CS') catColor = 'bg-rose-100 text-rose-800';
          if (sop.category === 'Design Brief') catColor = 'bg-amber-100 text-amber-800';

          return (
            <div 
              key={sop.id} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded shadow-xs ${catColor}`}>
                    {sop.category}
                  </span>
                  <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
                </div>

                <div>
                  <h4 className="font-extrabold text-[#1E3A8A] text-sm tracking-tight leading-snug">{sop.title}</h4>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1.5">
                    {sop.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Sensus: 100% SLA Compliance</span>
                <button
                  onClick={() => setReviewSop(sop)}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 font-bold tracking-tight hover:underline"
                >
                  <span>Baca SOP</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* READ PREVIEW MODAL POPUP */}
      {reviewSop && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 animate-slide-up text-gray-800">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[8px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  DOKUMEN OPERASIONAL RESMI
                </span>
                <h3 className="text-sm font-extrabold text-[#111827] leading-snug">{reviewSop.title}</h3>
              </div>
              <button 
                onClick={() => setReviewSop(null)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 shrink-0"
              >
                ✕
              </button>
            </div>
            
            {/* Rule contents block */}
            <div className="py-5 space-y-4">
              <p className="text-xs text-gray-400 font-semibold uppercase font-mono">Ketentuan Teknis Wajib:</p>
              
              <div className="bg-gray-50/80 p-4.5 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed font-sans space-y-3 max-h-72 overflow-y-auto">
                {reviewSop.content.split('\n').map((line, i) => (
                  <p key={i} className="font-medium text-gray-700">{line}</p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setReviewSop(null)}
                className="p-2.5 px-6 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-800 transition"
              >
                Selesai Membaca & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
