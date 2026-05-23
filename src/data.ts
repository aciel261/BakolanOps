import { User, Store, Task, Campaign, AdPerformance, Product, SOP, Notification, ActivityLog } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Budi Santoso', email: 'budi@marketops.com', role: 'Lead Marketplace', department: 'Management', avatar: 'BS', active: true },
  { id: 'usr-2', name: 'Siti Rahma', email: 'siti@marketops.com', role: 'Marketplace Specialist', department: 'Operations', avatar: 'SR', active: true },
  { id: 'usr-3', name: 'Andi Wijaya', email: 'andi@marketops.com', role: 'Ads Specialist', department: 'Marketing', avatar: 'AW', active: true },
  { id: 'usr-4', name: 'Rian Putera', email: 'rian@marketops.com', role: 'Designer / Content', department: 'Creative', avatar: 'RP', active: true },
  { id: 'usr-5', name: 'Dewi Lestari', email: 'dewi@marketops.com', role: 'Admin / CS', department: 'Customer Service', avatar: 'DL', active: true },
];

export const INITIAL_STORES: Store[] = [
  { id: 'store-1', name: 'Wardah Official Shopee', marketplace: 'Shopee', brand: 'Wardah', picId: 'usr-2', url: 'https://shopee.co.id/wardahofficial', category: 'Beauty', targetGmv: 250000000, status: 'Active', notes: 'Fokus optimasi produk hero harian.' },
  { id: 'store-2', name: 'Eiger Adventure Tokopedia', marketplace: 'Tokopedia', brand: 'Eiger', picId: 'usr-2', url: 'https://tokopedia.com/eiger', category: 'Fashion/Outdoor', targetGmv: 180000000, status: 'Active', notes: 'Persiapan rilis produk kolaborasi baru.' },
  { id: 'store-3', name: 'Erigo Official TikTok Shop', marketplace: 'TikTok Shop', brand: 'Erigo', picId: 'usr-5', url: 'https://tiktok.com/@erigo', category: 'Fashion', targetGmv: 350000000, status: 'Active', notes: 'Kebutuhan livestreaming 12 jam sehari.' },
  { id: 'store-4', name: 'Lazada Samsung Store', marketplace: 'Lazada', brand: 'Samsung', picId: 'usr-3', url: 'https://lazada.co.id/samsung', category: 'Electronics', targetGmv: 500000000, status: 'Maintenance', notes: 'Migrasi integrasi stok warehouse.' }
];

export const INITIAL_TASKS: Task[] = [
  { 
    id: 'task-1', 
    title: 'Optimasi SEO Judul Produk Hero', 
    description: 'Ganti judul produk terlaris dengan formula baru: Brand + Kategori + Atribut + Keyword Utama.', 
    storeId: 'store-1', 
    assignedTo: 'usr-2', 
    department: 'Operations', 
    priority: 'High', 
    deadline: '2026-05-28', 
    status: 'In Progress', 
    checklist: [
      { text: 'Riset kata kunci Shopee Coach', done: true }, 
      { text: 'Update 10 produk terlaris', done: false }
    ], 
    createdBy: 'usr-1', 
    createdAt: '2026-05-15', 
    comments: [] 
  },
  { 
    id: 'task-2', 
    title: 'Desain Banner Promo Shopee 5.5', 
    description: 'Buat banner utama ukuran 1200x1200px dan banner slide untuk promo Double Date.', 
    storeId: 'store-1', 
    assignedTo: 'usr-4', 
    department: 'Creative', 
    priority: 'Critical', 
    deadline: '2026-05-24', 
    status: 'Need Review', 
    checklist: [
      { text: 'Banner Utama 1:1', done: true }, 
      { text: 'Banner Voucher Toko', done: true }
    ], 
    proofUrl: 'https://drive.google.com/file/d/banner-5-5-draft', 
    createdBy: 'usr-1', 
    createdAt: '2026-05-01', 
    comments: [] 
  },
  { 
    id: 'task-3', 
    title: 'Update Stok Flash Sale Tokopedia', 
    description: 'Pastikan alokasi stok untuk flash sale jam 12:00 WIB sebanyak 50 unit per SKU.', 
    storeId: 'store-2', 
    assignedTo: 'usr-5', 
    department: 'Customer Service', 
    priority: 'High', 
    deadline: '2026-05-25', 
    status: 'Done', 
    checklist: [
      { text: 'Update kuota stok di seller center', done: true }
    ], 
    proofUrl: 'https://imgur.com/screenshot-stok', 
    createdBy: 'usr-2', 
    createdAt: '2026-05-09', 
    comments: [] 
  },
  { 
    id: 'task-4', 
    title: 'Optimasi Struktur Iklan Shopee', 
    description: 'Evaluasi kata kunci boncos pada iklan pencarian produk pintar.', 
    storeId: 'store-1', 
    assignedTo: 'usr-3', 
    department: 'Marketing', 
    priority: 'Medium', 
    deadline: '2026-05-29', 
    status: 'Todo', 
    checklist: [
      { text: 'Download report iklan 30 hari terakhir', done: false }, 
      { text: 'Negatifkan keyword dengan CTR < 1%', done: false }
    ], 
    createdBy: 'usr-1', 
    createdAt: '2026-05-14', 
    comments: [] 
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { 
    id: 'camp-1', 
    name: 'Shopee 6.6 Super Brand Day', 
    storeId: 'store-1', 
    type: 'Double Date', 
    objective: 'Meningkatkan GMV 2x lipat harian', 
    startDate: '2026-06-01', 
    endDate: '2026-06-06', 
    targetGmv: 150000000, 
    budget: 15000000, 
    picId: 'usr-2', 
    status: 'Running', 
    actualGmv: 0, 
    actualOrders: 0, 
    checklist: [
      { text: 'Daftar Campaign di Seller Center', done: true }, 
      { text: 'Submit Banner Promo', done: true }, 
      { text: 'Set Up Voucher Diskon', done: false }, 
      { text: 'Broadcast Chat Pengikut', done: false }
    ] 
  },
  { 
    id: 'camp-2', 
    name: 'Tokopedia WIB (Waktu Indonesia Belanja)', 
    storeId: 'store-2', 
    type: 'Payday', 
    objective: 'Mendorong penjualan akhir bulan', 
    startDate: '2026-05-25', 
    endDate: '2026-05-31', 
    targetGmv: 100000000, 
    budget: 8000000, 
    picId: 'usr-2', 
    status: 'Draft', 
    actualGmv: 0, 
    actualOrders: 0, 
    checklist: [
      { text: 'Daftar Flash Sale Tokopedia', done: false }, 
      { text: 'Dekorasi Toko Edisi WIB', done: false }
    ] 
  }
];

export const INITIAL_ADS: AdPerformance[] = [
  { id: 'ads-1', storeId: 'store-1', productName: 'Wardah Lightening Serum 30ml', marketplace: 'Shopee', date: '2026-05-22', budget: 1000000, spend: 850000, gmvAds: 3400000, ctr: 3.4, cpc: 450, conversionRate: 4.5, roas: 4.0, actionStatus: 'Scale Up', notes: 'Performa sangat bagus. Tingkatkan budget harian.' },
  { id: 'ads-2', storeId: 'store-2', productName: 'Eiger Backpack 30L', marketplace: 'Tokopedia', date: '2026-05-22', budget: 800000, spend: 750000, gmvAds: 1125000, ctr: 1.8, cpc: 600, conversionRate: 1.2, roas: 1.5, actionStatus: 'Optimize', notes: 'Biaya per klik tinggi. Cari kata kunci yang lebih relevan.' },
  { id: 'ads-3', storeId: 'store-3', productName: 'Erigo T-Shirt Basic Black', marketplace: 'TikTok Shop', date: '2026-05-21', budget: 2000000, spend: 1900000, gmvAds: 950000, ctr: 0.9, cpc: 1200, conversionRate: 0.5, roas: 0.5, actionStatus: 'Stop', notes: 'ROAS terlalu rendah, konten kreatif kurang memikat.' }
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'prod-1', 
    name: 'Wardah Lightening Day Cream 30g', 
    sku: 'WRD-LDC-30', 
    storeId: 'store-1', 
    productUrl: 'https://shopee.co.id/wardah-lightening-day-cream', 
    price: 45000, 
    stock: 150, 
    checklist: { seoTitle: true, images: true, video: true, description: true, keyword: true, promo: true, competitivePrice: true, rating: true, stock: true }, 
    score: 100, 
    notes: 'Kualitas konten listing dioptimalkan sepenuhnya untuk algoritma pencarian Shopee.' 
  },
  { 
    id: 'prod-2', 
    name: 'Eiger Wanderlust Jacket Trail', 
    sku: 'EGR-WLJ-XL', 
    storeId: 'store-2', 
    productUrl: 'https://tokopedia.com/eiger/wanderlust-jacket', 
    price: 650000, 
    stock: 12, 
    checklist: { seoTitle: true, images: false, video: false, description: true, keyword: false, promo: true, competitivePrice: true, rating: false, stock: true }, 
    score: 55, 
    notes: 'Nilai SEO rendah. Masih belum ditambahkan video demonstrasi produk dan riset query kata kunci.' 
  }
];

export const INITIAL_SOPS: SOP[] = [
  { 
    id: 'sop-1', 
    title: 'Protokol Set Up Campaign Double Date', 
    category: 'Campaign', 
    description: 'Panduan lengkap konfigurasi promo, dekorasi toko, dan alokasi stok di marketplace panel.', 
    fileUrl: '#',
    content: `1. Melakukan registrasi program Campaign besar di platform Shopee/Tokopedia paling lambat H-10.
2. Mengumpulkan banner promosi dari tim Creative: Banner Utama (1:1), Banner Slide, Banner Voucher.
3. Melakukan setting diskon harga khusus campaign di menu fitur promosi platform.
4. Menyiapkan alokasi kuota stok khusus agar tidak terjadi over-selling dengan stok reguler.
5. Melakukan broadcast chat pengikut toko sebanyak 2 kali: H-1 malam dan Hari H siang.`
  },
  { 
    id: 'sop-2', 
    title: 'Desain Banner Promo CTR Tinggi', 
    category: 'Design Brief', 
    description: 'Pedoman pembuatan banner e-commerce untuk mengoptimalkan rasio klik masuk.', 
    fileUrl: '#',
    content: `1. Gunakan rasio aspek wajib 1:1 (min. 1200x1200px) untuk feed dan listing toko.
2. Cantumkan nominal diskon/cashback yang mencolok (font size minimal 18pt), kontras dengan warna background.
3. Pastikan gambar produk terlihat jelas tanpa noise background berlebihan, letakkan di sisi kanan banner.
4. Tambahkan logo brand resmi di posisi sudut kiri atas.
5. Gunakan warna representatif platform (Oranye untuk Shopee, Hijau untuk Tokopedia) untuk memicu psikologi urgensi pembelian.`
  },
  { 
    id: 'sop-3', 
    title: 'Alur Penanganan Komplain & Retur Shopee', 
    category: 'CS', 
    description: 'Standar balas chat komplain, penolakan, dan persetujuan pengembalian dana barang cacat.', 
    fileUrl: '#',
    content: `1. Balas chat pengaduan pembeli dengan sapaan hormat dan meminta maaf atas ketidaknyamanan.
2. Minta pembeli untuk mengirimkan video unboxing utuh tanpa edit sebagai bukti utama validasi.
3. Jika terdapat bukti video valid, tawarkan opsi retur barang utuh atau pengembalian dana sebagian.
4. Jika tidak ada bukti video valid setelah 1x24 jam, ajukan banding penolakan retur melaui sistem agen sengketa Shopee.
5. Seluruh proses penanganan retur wajib diselesaikan di bawah batas SLA Shopee 48 jam.`
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'not-1', message: 'Tugas baru dikirim untuk review: "Desain Banner Promo Shopee 5.5"', time: '10 menit yang lalu', unread: true },
  { id: 'not-2', message: 'Toko "Lazada Samsung Store" berganti status ke "Maintenance" karena sinkronisasi stok API.', time: '2 jam yang lalu', unread: true },
  { id: 'not-3', message: 'Campaign "Shopee 5.5 Super Brand Day" selesai. Harap input data penjualan aktual.', time: '1 hari yang lalu', unread: false }
];

export const INITIAL_LOGS: ActivityLog[] = [
  { id: 'log-1', entityType: 'Task', action: 'Membuat Tugas Baru', details: 'Budi Santoso membuat tugas "Optimasi SEO Judul Produk Hero"', changedBy: 'Budi Santoso', timestamp: '2026-05-23 09:12' },
  { id: 'log-2', entityType: 'Store', action: 'Memperbarui Detail Toko', details: 'Siti Rahma mengubah target GMV Wardah Official Shopee', changedBy: 'Siti Rahma', timestamp: '2026-05-23 11:02' },
  { id: 'log-3', entityType: 'Ads', action: 'Input Kinerja Iklan', details: 'Andi Wijaya mengamati drop ROAS dan merekomendasikan penyesuaian bidding', changedBy: 'Andi Wijaya', timestamp: '2026-05-23 14:30' }
];
