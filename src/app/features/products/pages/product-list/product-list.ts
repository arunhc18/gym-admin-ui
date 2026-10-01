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
  selectedTenant = '';
  selectedStatus = '';
  selectedType = '';

  modal: 'product' | 'category' | 'inventory' | 'transaction' | null = null;

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

  tenantName(tenantId: number): string {
    return this.tenants.find(tenant => tenant.tenantId === tenantId)?.tenantName ?? 'Unknown tenant';
  }

  categoryName(categoryId?: number | null): string {
    return this.categories.find(category => category.categoryId === categoryId)?.categoryName ?? '-';
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
    this.productForm = this.emptyProduct();
    this.modal = 'product';
  }

  openAddCategory(): void {
    this.formError = '';
    this.categoryForm = this.emptyCategory();
    this.modal = 'category';
  }

  openAddInventory(): void {
    this.formError = '';
    this.stockForm = this.emptyStock('in');
    this.modal = 'inventory';
  }

  openAddTransaction(): void {
    this.formError = '';
    this.stockForm = this.emptyStock('in');
    this.modal = 'transaction';
  }

  closeModal(): void {
    this.modal = null;
    this.formError = '';
  }

  saveModal(): void {
    try {
      if (this.modal === 'product') {
        this.productService.createProduct(this.productForm);
      } else if (this.modal === 'category') {
        this.productService.createCategory(this.categoryForm);
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
  }
}
