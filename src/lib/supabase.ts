import { createClient } from '@supabase/supabase-js';
import { User, Store, Task, Campaign, AdPerformance, Product, SOP, Notification, ActivityLog } from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STORES, 
  INITIAL_TASKS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_ADS, 
  INITIAL_PRODUCTS, 
  INITIAL_SOPS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_LOGS 
} from '../data';

// Read public environment variables or local storage overrides safely
const envSource = (import.meta as any).env || {};
const rawUrl = envSource.VITE_SUPABASE_URL || localStorage.getItem('temp_supabase_url') || '';
const rawKey = envSource.VITE_SUPABASE_ANON_KEY || localStorage.getItem('temp_supabase_anon_key') || '';

const supabaseUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Script to run in Supabase SQL Editor.
 * This is exposed in the UI so the user can easily copy and paste it.
 */
export const SUPABASE_SQL_SCHEMA = `-- COPY-PASTE UTK SQL EDITOR DI SUPABASE
-- 1. Tabel Anggota Tim (Users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  avatar TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- 2. Tabel Toko Marketplace (Stores)
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  workspace_marketplace TEXT NOT NULL, -- Diubah agar beda keyword jika ada constraint
  brand TEXT NOT NULL,
  "picId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  url TEXT,
  category TEXT,
  "targetGmv" NUMERIC DEFAULT 0,
  status TEXT NOT NULL,
  notes TEXT
);

-- 3. Tabel Tugas Operasional (Tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "storeId" TEXT REFERENCES stores(id) ON DELETE CASCADE,
  "assignedTo" TEXT REFERENCES users(id) ON DELETE SET NULL,
  department TEXT NOT NULL,
  priority TEXT NOT NULL,
  deadline TEXT,
  status TEXT NOT NULL,
  checklist JSONB DEFAULT '[]'::jsonB,
  "proofUrl" TEXT,
  "createdBy" TEXT,
  "createdAt" TEXT,
  comments JSONB DEFAULT '[]'::jsonB
);

-- 4. Tabel Campaign Digital (Campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "storeId" TEXT REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  objective TEXT,
  "startDate" TEXT,
  "endDate" TEXT,
  "targetGmv" NUMERIC DEFAULT 0,
  budget TEXT, -- simpan numerik/teks
  "picId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  "actualGmv" NUMERIC DEFAULT 0,
  "actualOrders" NUMERIC DEFAULT 0,
  checklist JSONB DEFAULT '[]'::jsonB
);

-- 5. Tabel Performa Iklan (Ads)
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  "storeId" TEXT REFERENCES stores(id) ON DELETE CASCADE,
  "productName" TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  date TEXT,
  budget NUMERIC DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  "gmvAds" NUMERIC DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  "conversionRate" NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  "actionStatus" TEXT NOT NULL,
  notes TEXT
);

-- 6. Tabel Master Produk (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  "storeId" TEXT REFERENCES stores(id) ON DELETE CASCADE,
  "productUrl" TEXT,
  price NUMERIC DEFAULT 0,
  stock NUMERIC DEFAULT 0,
  checklist JSONB DEFAULT '{}'::jsonB,
  score NUMERIC DEFAULT 0,
  notes TEXT
);

-- 7. Tabel SOP Kualitas (Sops)
CREATE TABLE IF NOT EXISTS sops (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  "fileUrl" TEXT,
  content TEXT
);

-- 8. Tabel Notifikasi (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE
);

-- 9. Tabel Log Aktivitas (Logs)
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  "entityType" TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  "changedBy" TEXT,
  timestamp TEXT NOT NULL
);

-- Aktifkan Row Level Security (RLS) & buat Bypass Policy agar tim bisa kolaborasi
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select table users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert table users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table users" ON users FOR DELETE USING (true);

CREATE POLICY "Allow public select table stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow public insert table stores" ON stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table stores" ON stores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table stores" ON stores FOR DELETE USING (true);

CREATE POLICY "Allow public select table tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert table tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table tasks" ON tasks FOR DELETE USING (true);

CREATE POLICY "Allow public select table campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert table campaigns" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table campaigns" ON campaigns FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table campaigns" ON campaigns FOR DELETE USING (true);

CREATE POLICY "Allow public select table ads" ON ads FOR SELECT USING (true);
CREATE POLICY "Allow public insert table ads" ON ads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table ads" ON ads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table ads" ON ads FOR DELETE USING (true);

CREATE POLICY "Allow public select table products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert table products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public select table sops" ON sops FOR SELECT USING (true);
CREATE POLICY "Allow public insert table sops" ON sops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table sops" ON sops FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table sops" ON sops FOR DELETE USING (true);

CREATE POLICY "Allow public select table notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert table notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table notifications" ON notifications FOR DELETE USING (true);

CREATE POLICY "Allow public select table logs" ON logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert table logs" ON logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update table logs" ON logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete table logs" ON logs FOR DELETE USING (true);
`;

// Helper untuk membersihkan null data sebelum mengunduh / mengunggah ke Supabase
function cleanData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// -----------------------------------------------------
// DATABASE SEEDING UTILITY
// -----------------------------------------------------
export async function seedDatabaseIfEmpty() {
  if (!supabase) return;

  try {
    // 1. Seed Users
    const { data: usersData, error: usersErr } = await supabase.from('users').select('id');
    if (!usersErr && (!usersData || usersData.length === 0)) {
      await supabase.from('users').insert(INITIAL_USERS);
    }

    // 2. Seed Stores
    const { data: storesData, error: storesErr } = await supabase.from('stores').select('id');
    if (!storesErr && (!storesData || storesData.length === 0)) {
      // Map 'marketplace' field to avoid key disputes
      const mapped = INITIAL_STORES.map(s => ({
        id: s.id,
        name: s.name,
        workspace_marketplace: s.marketplace,
        brand: s.brand,
        picId: s.picId,
        url: s.url,
        category: s.category,
        targetGmv: s.targetGmv,
        status: s.status,
        notes: s.notes
      }));
      await supabase.from('stores').insert(mapped);
    }

    // 3. Seed Tasks
    const { data: tasksData, error: tasksErr } = await supabase.from('tasks').select('id');
    if (!tasksErr && (!tasksData || tasksData.length === 0)) {
      await supabase.from('tasks').insert(INITIAL_TASKS.map(t => cleanData(t)));
    }

    // 4. Seed Campaigns
    const { data: campsData, error: campsErr } = await supabase.from('campaigns').select('id');
    if (!campsErr && (!campsData || campsData.length === 0)) {
      await supabase.from('campaigns').insert(INITIAL_CAMPAIGNS.map(c => ({
        ...c,
        budget: String(c.budget) // safe-type
      })));
    }

    // 5. Seed Ads
    const { data: adsData, error: adsErr } = await supabase.from('ads').select('id');
    if (!adsErr && (!adsData || adsData.length === 0)) {
      await supabase.from('ads').insert(INITIAL_ADS);
    }

    // 6. Seed Products
    const { data: prodsData, error: prodsErr } = await supabase.from('products').select('id');
    if (!prodsErr && (!prodsData || prodsData.length === 0)) {
      await supabase.from('products').insert(INITIAL_PRODUCTS.map(p => cleanData(p)));
    }

    // 7. Seed SOPs
    const { data: sopsData, error: sopsErr } = await supabase.from('sops').select('id');
    if (!sopsErr && (!sopsData || sopsData.length === 0)) {
      await supabase.from('sops').insert(INITIAL_SOPS);
    }

    // 8. Seed Notifications
    const { data: notifData, error: notifErr } = await supabase.from('notifications').select('id');
    if (!notifErr && (!notifData || notifData.length === 0)) {
      await supabase.from('notifications').insert(INITIAL_NOTIFICATIONS);
    }

    // 9. Seed Logs
    const { data: logsData, error: logsErr } = await supabase.from('logs').select('id');
    if (!logsErr && (!logsData || logsData.length === 0)) {
      await supabase.from('logs').insert(INITIAL_LOGS);
    }

    console.log('Database Supabase berhasil di-seed dengan data awal!');
  } catch (err) {
    console.error('Seeding database error:', err);
  }
}

// -----------------------------------------------------
// ENTITY METHODS (CRUD)
// -----------------------------------------------------

export async function fetchUsers(): Promise<User[]> {
  if (!supabase) return INITIAL_USERS;
  const { data, error } = await supabase.from('users').select('*').order('name');
  if (error) {
    console.error('Error fetching users:', error);
    return INITIAL_USERS;
  }
  return data && data.length > 0 ? data : INITIAL_USERS;
}

export async function upsertUser(user: User) {
  if (!supabase) return;
  const { error } = await supabase.from('users').upsert(user);
  if (error) console.error('Error upserting user:', error);
}

export async function fetchStores(): Promise<Store[]> {
  if (!supabase) return INITIAL_STORES;
  const { data, error } = await supabase.from('stores').select('*').order('name');
  if (error) {
    console.error('Error fetching stores:', error);
    return INITIAL_STORES;
  }
  if (!data || data.length === 0) return INITIAL_STORES;
  
  // Map back workspace_marketplace values
  return data.map(dbStore => ({
    id: dbStore.id,
    name: dbStore.name,
    marketplace: dbStore.workspace_marketplace || dbStore.marketplace,
    brand: dbStore.brand,
    picId: dbStore.picId,
    url: dbStore.url,
    category: dbStore.category,
    targetGmv: Number(dbStore.targetGmv),
    status: dbStore.status,
    notes: dbStore.notes
  }));
}

export async function upsertStore(store: Store) {
  if (!supabase) return;
  const payload = {
    id: store.id,
    name: store.name,
    workspace_marketplace: store.marketplace,
    brand: store.brand,
    picId: store.picId,
    url: store.url,
    category: store.category,
    targetGmv: store.targetGmv,
    status: store.status,
    notes: store.notes
  };
  const { error } = await supabase.from('stores').upsert(payload);
  if (error) console.error('Error upserting store:', error);
}

export async function deleteStore(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) console.error('Error deleting store:', error);
}

export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) return INITIAL_TASKS;
  const { data, error } = await supabase.from('tasks').select('*').order('createdAt', { ascending: false });
  if (error || !data) {
    console.error('Error fetching tasks:', error);
    return INITIAL_TASKS;
  }
  if (data.length === 0) return INITIAL_TASKS;
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    storeId: item.storeId,
    assignedTo: item.assignedTo,
    department: item.department,
    priority: item.priority,
    deadline: item.deadline,
    status: item.status,
    checklist: Array.isArray(item.checklist) ? item.checklist : [],
    proofUrl: item.proofUrl,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    comments: Array.isArray(item.comments) ? item.comments : []
  }));
}

export async function upsertTask(task: Task) {
  if (!supabase) return;
  const { error } = await supabase.from('tasks').upsert({
    id: task.id,
    title: task.title,
    description: task.description,
    storeId: task.storeId,
    assignedTo: task.assignedTo,
    department: task.department,
    priority: task.priority,
    deadline: task.deadline,
    status: task.status,
    checklist: cleanData(task.checklist),
    proofUrl: task.proofUrl,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    comments: cleanData(task.comments)
  });
  if (error) console.error('Error upserting task:', error);
}

export async function deleteTask(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) console.error('Error deleting task:', error);
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (!supabase) return INITIAL_CAMPAIGNS;
  const { data, error } = await supabase.from('campaigns').select('*').order('startDate');
  if (error || !data) {
    console.error('Error fetching campaigns:', error);
    return INITIAL_CAMPAIGNS;
  }
  if (data.length === 0) return INITIAL_CAMPAIGNS;
  return data.map(item => ({
    id: item.id,
    name: item.name,
    storeId: item.storeId,
    type: item.type,
    objective: item.objective,
    startDate: item.startDate,
    endDate: item.endDate,
    targetGmv: Number(item.targetGmv),
    budget: Number(item.budget),
    picId: item.picId,
    status: item.status,
    actualGmv: Number(item.actualGmv),
    actualOrders: Number(item.actualOrders),
    checklist: Array.isArray(item.checklist) ? item.checklist : []
  }));
}

export async function upsertCampaign(campaign: Campaign) {
  if (!supabase) return;
  const { error } = await supabase.from('campaigns').upsert({
    id: campaign.id,
    name: campaign.name,
    storeId: campaign.storeId,
    type: campaign.type,
    objective: campaign.objective,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    targetGmv: campaign.targetGmv,
    budget: String(campaign.budget),
    picId: campaign.picId,
    status: campaign.status,
    actualGmv: campaign.actualGmv,
    actualOrders: campaign.actualOrders,
    checklist: cleanData(campaign.checklist)
  });
  if (error) console.error('Error upserting campaign:', error);
}

export async function deleteCampaign(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) console.error('Error deleting campaign:', error);
}

export async function fetchAds(): Promise<AdPerformance[]> {
  if (!supabase) return INITIAL_ADS;
  const { data, error } = await supabase.from('ads').select('*').order('date', { ascending: false });
  if (error || !data) {
    console.error('Error fetching ads:', error);
    return INITIAL_ADS;
  }
  if (data.length === 0) return INITIAL_ADS;
  return data.map(item => ({
    id: item.id,
    storeId: item.storeId,
    productName: item.productName,
    marketplace: item.marketplace,
    date: item.date,
    budget: Number(item.budget),
    spend: Number(item.spend),
    gmvAds: Number(item.gmvAds),
    ctr: Number(item.ctr),
    cpc: Number(item.cpc),
    conversionRate: Number(item.conversionRate),
    roas: Number(item.roas),
    actionStatus: item.actionStatus,
    notes: item.notes
  }));
}

export async function upsertAd(ad: AdPerformance) {
  if (!supabase) return;
  const { error } = await supabase.from('ads').upsert(ad);
  if (error) console.error('Error upserting ad performance:', error);
}

export async function deleteAd(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('ads').delete().eq('id', id);
  if (error) console.error('Error deleting ad:', error);
}

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) return INITIAL_PRODUCTS;
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error || !data) {
    console.error('Error fetching products:', error);
    return INITIAL_PRODUCTS;
  }
  if (data.length === 0) return INITIAL_PRODUCTS;
  return data.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    storeId: item.storeId,
    productUrl: item.productUrl,
    price: Number(item.price),
    stock: Number(item.stock),
    checklist: item.checklist || {},
    score: Number(item.score),
    notes: item.notes
  }));
}

export async function upsertProduct(product: Product) {
  if (!supabase) return;
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    name: product.name,
    sku: product.sku,
    storeId: product.storeId,
    productUrl: product.productUrl,
    price: product.price,
    stock: product.stock,
    checklist: cleanData(product.checklist),
    score: product.score,
    notes: product.notes
  });
  if (error) console.error('Error upserting product:', error);
}

export async function deleteProduct(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('Error deleting product:', error);
}

export async function fetchSops(): Promise<SOP[]> {
  if (!supabase) return INITIAL_SOPS;
  const { data, error } = await supabase.from('sops').select('*').order('title');
  if (error || !data) {
    console.error('Error fetching sops:', error);
    return INITIAL_SOPS;
  }
  if (data.length === 0) return INITIAL_SOPS;
  return data;
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (!supabase) return INITIAL_NOTIFICATIONS;
  const { data, error } = await supabase.from('notifications').select('*').order('id', { ascending: false });
  if (error || !data) {
    console.error('Error fetching notifications:', error);
    return INITIAL_NOTIFICATIONS;
  }
  if (data.length === 0) return INITIAL_NOTIFICATIONS;
  return data;
}

export async function upsertNotification(notif: Notification) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').upsert(notif);
  if (error) console.error('Error upserting notification:', error);
}

export async function deleteNotification(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) console.error('Error deleting notification:', error);
}

export async function fetchLogs(): Promise<ActivityLog[]> {
  if (!supabase) return INITIAL_LOGS;
  const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false });
  if (error || !data) {
    console.error('Error fetching logs:', error);
    return INITIAL_LOGS;
  }
  if (data.length === 0) return INITIAL_LOGS;
  return data;
}

export async function appendLog(log: ActivityLog) {
  if (!supabase) return;
  const { error } = await supabase.from('logs').upsert(log);
  if (error) console.error('Error appending activity log:', error);
}
