export type NodeType = 'SEEDED' | 'ADMIN_CREATED' | 'LEAF';
export type AttributeType = 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  depth: number;
  nodeType: NodeType;
  active: boolean;
  demandeCount: number;
  children: CategoryTreeNode[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  path: string;
  depth: number;
  nodeType: NodeType;
  active: boolean;
  demandeCount: number;
  parentId: number | null;
  parentName: string | null;
  childrenCount: number;
}

export interface CategoryAttributeResponse {
  id: number;
  categoryId: number;
  key: string;
  label: string;
  type: AttributeType;
  required: boolean;
  inherited: boolean;
  overrides: boolean;
  inheritedFrom: string | null;
  displayOrder: number;
  options: string[] | null;
}

export interface CategoryStatsResponse {
  id: number;
  name: string;
  totalDemandes: number;
  totalDemandesInSubtree: number;
  activeSuppliers: number;
  totalSuppliersInSubtree: number;
  childrenCount: number;
  depth: number;
  hasActiveChildren: boolean;
}

export interface CategoryCreateRequest {
  name: string;
  parentId: number | null;
}

export interface CategoryRenameRequest {
  name: string;
  forceRename?: boolean;
}

export interface CategoryAttributeRequest {
  key: string;
  label: string;
  type: AttributeType;
  required: boolean;
  displayOrder: number;
  options?: string[];
}

export type DialogState =
  | { type: 'addChild'; parentId: number | null; parentName: string }
  | { type: 'rename'; node: CategoryTreeNode }
  | { type: 'move'; node: CategoryTreeNode }
  | { type: 'delete'; node: CategoryTreeNode }
  | { type: 'toggleActive'; node: CategoryTreeNode };
