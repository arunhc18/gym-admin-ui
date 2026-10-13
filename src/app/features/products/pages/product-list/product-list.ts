import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tenant } from '../../../platform/tenants/models/tenant.model';
import { TenantService } from '../../../platform/tenants/services/tenant';
import {
  CategoryRequest,
  InventoryRecord,
  Product,
  ProductCategory,
  ProductLocation,
  ProductRequest,
  ProductType,
  StockReferenceType,
  StockTransaction,
  StockTransactionRequest,
  StockTransactionType
} from '../../models/product.model';
import { ProductService } from '../../services/product';

type ProductTab = 'products' | 'categories' | 'inventory' | 'transactions';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {
  activeTab: ProductTab = 'products';
  tenants: Tenant[] = [];
  locations: ProductLocation[] = [];
  categories: ProductCategory[] = [];
  products: Product[] = [];
  inventory: InventoryRecord[] = [];
  transactions: StockTransaction[] = [];
  productSearch = '';
  categorySearch = '';
  inventorySearch = '';
  transactionSearch = '';
  selectedTenant = '';
  selectedStatus = '';
  selectedType = '';

  modal: 'product' | 'category' | 'inventory' | 'transaction' | null = null;

  editingProductId: number | null = null;
  editingCategoryId: number | null = null;
  editingInventoryId: number | null = null;
  editingTransactionId: number | null = null;
  inventoryEditMinimum = 0;

  deleteConfirmation: {
    kind: 'product' | 'category' | 'inventory' | 'transaction';
    id: number;
    label: string;
  } | null = null;
  deleteError = '';

  productForm: ProductRequest = this.emptyProduct();

  categoryForm: CategoryRequest = this.emptyCategory();

  stockForm: StockTransactionRequest = this.emptyStock();

  formError = '';

  constructor(
    private readonly productService: ProductService,
    private readonly tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.tenantService.getTenants().subscribe(tenants => this.tenants = tenants);
    this.locations = this.productService.getLocations();
    this.productService.products$.subscribe(products => this.products = products);
    this.productService.categories$.subscribe(categories => this.categories = categories);
    this.productService.inventory$.subscribe(inventory => this.inventory = inventory);
    this.productService.transactions$.subscribe(transactions => this.transactions = transactions);
  }

  get filteredProducts(): Product[] {
    const search = this.productSearch.trim().toLowerCase();
    return this.products.filter(product => {
      const matchesSearch = !search || [product.productName, product.productCode, product.barcode ?? ''].some(value => value.toLowerCase().includes(search));
      const matchesTenant = !this.selectedTenant || product.tenantId === Number(this.selectedTenant);
      const matchesStatus = !this.selectedStatus || (this.selectedStatus === 'active' ? product.isActive : !product.isActive);
      const matchesType = !this.selectedType || product.productType === this.selectedType;
      return matchesSearch && matchesTenant && matchesStatus && matchesType;
    });
  }

  get filteredCategories(): ProductCategory[] {
    const search = this.categorySearch.trim().toLowerCase();
    return this.categories.filter(category =>
      !search || [category.categoryName, category.description ?? '', this.tenantName(category.tenantId)]
        .some(value => value.toLowerCase().includes(search))
    );
  }

  get filteredInventory(): InventoryRecord[] {
    const search = this.inventorySearch.trim().toLowerCase();
    return this.inventory.filter(item =>
      !search || [this.productName(item.productId), this.locationName(item.locationId), String(item.quantityOnHand), String(item.quantityAvailable)]
        .some(value => value.toLowerCase().includes(search))
    );
  }

  get filteredTransactions(): StockTransaction[] {
    const search = this.transactionSearch.trim().toLowerCase();
    return this.transactions.filter(transaction =>
      !search || [
        this.productName(transaction.productId),
        this.locationName(transaction.locationId),
        transaction.transactionType,
        String(transaction.quantity),
        transaction.notes ?? '',
        transaction.referenceId == null ? '' : String(transaction.referenceId)
      ].some(value => value.toLowerCase().includes(search))
    );
  }

  tenantName(tenantId: number): string {
    return this.tenants.find(tenant => tenant.tenantId === tenantId)?.tenantName ?? 'Unknown tenant';
  }

  categoryName(categoryId?: number | null): string {
    return this.categories.find(category => category.categoryId === categoryId)?.categoryName ?? '-';
  }

  categoriesForTenant(tenantId: number): ProductCategory[] {
    return this.categories.filter(category => category.tenantId === tenantId);
  }

  locationName(locationId: number): string {
    return this.locations.find(location => location.locationId === locationId)?.locationName ?? '-';
  }

  availableStock(productId: number): number {
    return this.inventory.filter(item => item.productId === productId).reduce((total, item) => total + item.quantityAvailable, 0);
  }

  toggleProduct(product: Product): void {
    this.productService.setProductActiveStatus(product.productId, !product.isActive);
  }

  openAddProduct(): void {
    this.formError = '';
    this.editingProductId = null;
    this.productForm = this.emptyProduct();
    this.modal = 'product';
  }

  editProduct(product: Product): void {
    this.formError = '';
    this.editingProductId = product.productId;
    this.productForm = {
      tenantId: product.tenantId,
      categoryId: product.categoryId ?? null,
      productName: product.productName,
      productCode: product.productCode,
      description: product.description ?? '',
      barcode: product.barcode ?? '',
      productType: product.productType ?? 'supplement',
      unitOfMeasure: product.unitOfMeasure ?? 'piece',
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice ?? 0,
      taxPercentage: product.taxPercentage,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel ?? null,
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive
    };
    this.modal = 'product';
  }

  openAddCategory(): void {
    this.formError = '';
    this.editingCategoryId = null;
    this.categoryForm = this.emptyCategory();
    this.modal = 'category';
  }

  editCategory(category: ProductCategory): void {
    this.formError = '';
    this.editingCategoryId = category.categoryId;
    this.categoryForm = {
      tenantId: category.tenantId,
      categoryName: category.categoryName,
      description: category.description ?? '',
      parentCategoryId: category.parentCategoryId ?? null,
      isActive: category.isActive
    };
    this.modal = 'category';
  }

  openAddInventory(): void {
    this.formError = '';
    this.editingInventoryId = null;
    this.stockForm = this.emptyStock('in');
    this.modal = 'inventory';
  }

  editInventory(item: InventoryRecord): void {
    this.formError = '';
    this.editingInventoryId = item.inventoryId;
    this.inventoryEditMinimum = item.quantityReserved;
    this.stockForm = {
      locationId: item.locationId,
      productId: item.productId,
      transactionType: 'adjustment',
      quantity: item.quantityOnHand,
      referenceType: 'adjustment',
      referenceId: item.inventoryId,
      notes: ''
    };
    this.modal = 'inventory';
  }

  openAddTransaction(): void {
    this.formError = '';
    this.editingTransactionId = null;
    this.stockForm = this.emptyStock('in');
    this.modal = 'transaction';
  }

  editTransaction(transaction: StockTransaction): void {
    this.formError = '';
    this.editingTransactionId = transaction.transactionId;
    this.stockForm = {
      locationId: transaction.locationId,
      productId: transaction.productId,
      transactionType: transaction.transactionType,
      quantity: transaction.quantity,
      referenceType: transaction.referenceType ?? null,
      referenceId: transaction.referenceId ?? null,
      notes: transaction.notes ?? ''
    };
    this.modal = 'transaction';
  }

  closeModal(): void {
    this.modal = null;
    this.formError = '';
    this.editingProductId = null;
    this.editingCategoryId = null;
    this.editingInventoryId = null;
    this.editingTransactionId = null;
  }

  saveModal(): void {
    try {
      if (this.modal === 'product') {
        if (this.editingProductId !== null) {
          this.productService.updateProduct(this.editingProductId, this.productForm);
        } else {
          this.productService.createProduct(this.productForm);
        }
      } else if (this.modal === 'category') {
        if (this.editingCategoryId !== null) {
          this.productService.updateCategory(this.editingCategoryId, this.categoryForm);
        } else {
          this.productService.createCategory(this.categoryForm);
        }
      } else if (this.modal === 'inventory' && this.editingInventoryId !== null) {
        this.productService.updateInventoryQuantity(this.editingInventoryId, Number(this.stockForm.quantity));
      } else if (this.modal === 'transaction' && this.editingTransactionId !== null) {
        this.productService.updateStockTransaction(this.editingTransactionId, this.stockForm);
      } else if (this.modal === 'inventory' || this.modal === 'transaction') {
        this.productService.recordStockTransaction(this.stockForm);
      }
      this.closeModal();
    } catch (error) {
      this.formError = error instanceof Error ? error.message : 'Unable to save this item.';
    }
  }

  productName(productId: number): string {
    return this.products.find(product => product.productId === productId)?.productName ?? '-';
  }

  requestDelete(
    kind: 'product' | 'category' | 'inventory' | 'transaction',
    id: number,
    label: string
  ): void {
    this.deleteError = '';
    this.deleteConfirmation = { kind, id, label };
  }

  confirmDelete(): void {
    if (!this.deleteConfirmation) {
      return;
    }

    const confirmation = this.deleteConfirmation;
    try {
      switch (confirmation.kind) {
        case 'product':
          this.productService.deleteProduct(confirmation.id);
          break;
        case 'category':
          this.productService.deleteCategory(confirmation.id);
          break;
        case 'inventory':
          this.productService.deleteInventory(confirmation.id);
          break;
        case 'transaction':
          this.productService.deleteStockTransaction(confirmation.id);
          break;
      }
      this.deleteConfirmation = null;
    } catch (error) {
      this.deleteError = error instanceof Error ? error.message : 'Unable to delete this item.';
    }
  }

  cancelDelete(): void {
    this.deleteConfirmation = null;
    this.deleteError = '';
  }

  private emptyProduct(): ProductRequest {
    return {
      tenantId: this.tenants[0]?.tenantId ?? 1,
      categoryId: null,
      productName: '',
      productCode: '',
      description: '',
      barcode: '',
      productType: 'supplement',
      unitOfMeasure: 'piece',
      sellingPrice: 0,
      costPrice: 0,
      taxPercentage: 0,
      minStockLevel: 0,
      maxStockLevel: null,
      imageUrl: '',
      isActive: true
    };
  }

  private emptyCategory(): CategoryRequest {
    return {
      tenantId: this.tenants[0]?.tenantId ?? 1,
      categoryName: '',
      description: '',
      parentCategoryId: null,
      isActive: true
    };
  }

  private emptyStock(transactionType: StockTransactionType = 'in'): StockTransactionRequest {
    return {
      locationId: this.locations[0]?.locationId ?? 1,
      productId: this.products[0]?.productId ?? 1,
      transactionType,
      quantity: 1,
      referenceType: transactionType === 'in' ? 'purchase' : transactionType as StockReferenceType,
      referenceId: null,
      notes: ''
    };
  }

  clearFilters(): void {
    this.productSearch = '';
    this.selectedTenant = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.categorySearch = '';
    this.inventorySearch = '';
    this.transactionSearch = '';
  }
}
