export type ProductType =
  | 'supplement'
  | 'merchandise'
  | 'equipment'
  | 'consumable';

export type StockTransactionType =
  | 'in'
  | 'out'
  | 'adjustment'
  | 'return';

export type StockReferenceType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'return';


export interface ProductCategory {

  categoryId: number;

  tenantId: number;

  categoryName: string;

  description?: string | null;

  parentCategoryId?: number | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface Product {

  productId: number;

  tenantId: number;

  categoryId?: number | null;

  productName: string;

  productCode: string;

  description?: string | null;

  barcode?: string | null;

  productType?: ProductType | null;

  unitOfMeasure?: string | null;

  sellingPrice: number;

  costPrice?: number | null;

  taxPercentage: number;

  minStockLevel: number;

  maxStockLevel?: number | null;

  imageUrl?: string | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface InventoryRecord {

  inventoryId: number;

  locationId: number;

  productId: number;

  quantityOnHand: number;

  quantityReserved: number;

  /*
   * SQL Server calculates this column:
   *
   * quantity_on_hand - quantity_reserved
   *
   * Never allow the user to edit this directly.
   */
  quantityAvailable: number;

  lastRestockDate?: string | null;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface StockTransaction {

  transactionId: number;

  locationId: number;

  productId: number;

  transactionType:
    StockTransactionType;

  quantity: number;

  referenceType?:
    StockReferenceType | null;

  referenceId?: number | null;

  transactionDate: string;

  notes?: string | null;

  createdBy: number;

  createdAt?: string;

  updatedAt?: string;

  updatedBy?: number | null;
}


export interface ProductLocation {

  locationId: number;

  tenantId: number;

  locationName: string;
}


export interface CategoryRequest {

  tenantId: number;

  categoryName: string;

  description?: string | null;

  parentCategoryId?: number | null;

  isActive: boolean;
}


export interface ProductRequest {

  tenantId: number;

  categoryId?: number | null;

  productName: string;

  productCode: string;

  description?: string | null;

  barcode?: string | null;

  productType?: ProductType | null;

  unitOfMeasure?: string | null;

  sellingPrice: number;

  costPrice?: number | null;

  taxPercentage: number;

  minStockLevel: number;

  maxStockLevel?: number | null;

  imageUrl?: string | null;

  isActive: boolean;
}


export interface StockTransactionRequest {

  locationId: number;

  productId: number;

  transactionType:
    StockTransactionType;

  quantity: number;

  referenceType?:
    StockReferenceType | null;

  referenceId?: number | null;

  notes?: string | null;
}