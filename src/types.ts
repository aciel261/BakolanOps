export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  active: boolean;
}

export interface Store {
  id: string;
  name: string;
  marketplace: 'Shopee' | 'Tokopedia' | 'TikTok Shop' | 'Lazada';
  brand: string;
  picId: string;
  url: string;
  category: string;
  targetGmv: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
  notes: string;
}

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  storeId: string;
  assignedTo: string;
  department: 'Management' | 'Operations' | 'Marketing' | 'Creative' | 'Customer Service';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: string;
  status: 'Todo' | 'In Progress' | 'Need Review' | 'Revision' | 'Done';
  checklist: ChecklistItem[];
  proofUrl?: string;
  createdBy: string;
  createdAt: string;
  comments: TaskComment[];
}

export interface Campaign {
  id: string;
  name: string;
  storeId: string;
  type: 'Double Date' | 'Flash Sale' | 'Payday';
  objective: string;
  startDate: string;
  endDate: string;
  targetGmv: number;
  picId: string;
  budget: number;
  status: 'Draft' | 'Running' | 'Finished';
  actualGmv: number;
  actualOrders: number;
  checklist: ChecklistItem[];
}

export interface AdPerformance {
  id: string;
  storeId: string;
  productName: string;
  marketplace: 'Shopee' | 'Tokopedia' | 'TikTok Shop' | 'Lazada';
  date: string;
  budget: number;
  spend: number;
  gmvAds: number;
  ctr: number; // Click-Through Rate (%)
  cpc: number; // Cost-Per-Click (IDR)
  conversionRate: number; // CR (%)
  roas: number;
  actionStatus: 'Scale Up' | 'Optimize' | 'Stop' | 'Hold';
  notes: string;
}

export interface ProductChecklist {
  seoTitle: boolean;
  images: boolean;
  video: boolean;
  description: boolean;
  keyword: boolean;
  promo: boolean;
  competitivePrice: boolean;
  rating: boolean;
  stock: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  storeId: string;
  productUrl: string;
  price: number;
  stock: number;
  checklist: ProductChecklist;
  score: number; // Calculated, e.g., 0-100
  notes: string;
}

export interface SOP {
  id: string;
  title: string;
  category: 'Campaign' | 'Design Brief' | 'CS' | 'Listing Optimization';
  description: string;
  fileUrl: string;
  content: string; // Detail SOP rules for rendering
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface ActivityLog {
  id: string;
  entityType: 'Store' | 'Task' | 'Campaign' | 'Ads' | 'Product' | 'Auth' | 'System';
  action: string;
  details: string;
  changedBy: string;
  timestamp: string;
}
