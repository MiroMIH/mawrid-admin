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

export type DemandeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

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
