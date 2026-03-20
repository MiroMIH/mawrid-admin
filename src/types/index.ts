export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type UserRole = 'BUYER' | 'SUPPLIER' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  role: UserRole;
  enabled: boolean;
  wilaya?: string;
  createdAt?: string;
}

export type NodeType = 'SEEDED' | 'ADMIN_CREATED' | 'LEAF';

export interface Category {
  id: number;
  name: string;
  slug: string;
  depth: number;
  active: boolean;
  nodeType: NodeType;
  path: string;
  parentId?: number;
  children?: Category[];
}

export type AttributeType = 'TEXT' | 'SELECT' | 'NUMBER';

export interface Attribute {
  id: number;
  key: string;
  label: string;
  type: AttributeType;
  required: boolean;
  displayOrder: number;
  inherited: boolean;
  options?: string[];
}

export interface CategoryStats {
  id: number;
  totalDemandes: number;
  totalDemandesInSubtree: number;
  childrenCount: number;
  hasActiveChildren: boolean;
}

export type DemandeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED' | 'EXPIRED';

export interface Demande {
  id: number;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  deadline: string;
  status: DemandeStatus;
  categoryId: number;
  wilaya: string;
  createdAt: string;
}

export interface DemandeAttribute {
  key: string;
  value: string;
  custom: boolean;
}

export interface DemandeSummary {
  id: string;
  title: string;
  quantity: number;
  unit: string;
  deadline?: string;
  status: DemandeStatus;
  qualityScore: number;
  categoryId: number;
  categoryName: string;
  buyerWilaya?: string;
  totalReponses: number;
  disponibleCount: number;
  createdAt: string;
  daysUntilDeadline: number;
}

export interface DemandeDetail {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  deadline?: string;
  wilaya?: string;
  qualityScore: number;
  status: DemandeStatus;
  categoryId: number;
  categoryName: string;
  buyerId: string;
  buyerCompanyName?: string;
  attachmentUrl?: string;
  attributes: DemandeAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface ScoreBreakdown {
  demandeId: string;
  supplierId: string;
  supplierName: string;
  supplierCompany?: string;
  supplierWilaya?: string;
  categoryScore: number;
  proximityScore: number;
  urgencyScore: number;
  buyerScore: number;
  quantityScore: number;
  baseScore: number;
  decayFactor: number;
  finalScore: number;
  notificationTier: string;
}

export interface DemandeStats {
  totalOpen: number;
  totalClosed: number;
  totalCancelled: number;
  totalExpired: number;
  totalAll: number;
}

export interface DashboardStats {
  totalUsers?: number;
  totalBuyers?: number;
  totalSuppliers?: number;
  totalDemandes?: number;
  openDemandes?: number;
  totalCategories?: number;
  activeCategories?: number;
  [key: string]: number | undefined;
}

export interface MatchingSimulation {
  categoryId: number;
  wilaya: string;
  deadline: string;
  quantity: number;
}
