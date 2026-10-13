import { TestBed } from '@angular/core/testing';
import { InventoryRecord, Product, StockTransaction, StockTransactionRequest } from '../models/product.model';
import { ProductService } from './product';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('records inventory edits as adjustments and reverses transaction deletions', () => {
    let inventory: InventoryRecord[] = [];
    let transactions: StockTransaction[] = [];
    service.inventory$.subscribe(value => inventory = value);
    service.transactions$.subscribe(value => transactions = value);

    const updated = service.updateInventoryQuantity(1, 30);
    expect(updated.quantityOnHand).toBe(30);
    expect(updated.quantityAvailable).toBe(27);
    expect(transactions[0].transactionType).toBe('adjustment');
    expect(transactions[0].quantity).toBe(6);

    service.deleteStockTransaction(transactions[0].transactionId);
    expect(inventory.find(item => item.inventoryId === 1)?.quantityOnHand).toBe(24);
  });

  it('reconciles edited stock transactions with the inventory balance', () => {
    let inventory: InventoryRecord[] = [];
    service.inventory$.subscribe(value => inventory = value);

    const request: StockTransactionRequest = {
      locationId: 1,
      productId: 1,
      transactionType: 'in',
      quantity: 18,
      referenceType: 'purchase',
      referenceId: 1001,
      notes: 'Updated restock'
    };

    service.updateStockTransaction(1, request);
    expect(inventory.find(item => item.inventoryId === 1)?.quantityOnHand).toBe(22);

    service.deleteStockTransaction(1);
    expect(inventory.find(item => item.inventoryId === 1)?.quantityOnHand).toBe(4);
  });

  it('rejects invalid product and category values', () => {
    expect(() => service.createProduct({
      tenantId: 1,
      categoryId: null,
      productName: ' ',
      productCode: 'PRD-NEW-001',
      description: '',
      barcode: '',
      productType: 'supplement',
      unitOfMeasure: 'piece',
      sellingPrice: 10,
      costPrice: 5,
      taxPercentage: 0,
      minStockLevel: 0,
      maxStockLevel: null,
      imageUrl: '',
      isActive: true
    })).toThrow('Product name must contain between 2 and 100 characters.');

    expect(() => service.createCategory({
      tenantId: 1,
      categoryName: 'Supplements',
      description: '',
      parentCategoryId: null,
      isActive: true
    })).toThrow('A category with this name already exists for the tenant.');
  });

  it('cascades linked stock data when inventory or product records are deleted', () => {
    let inventory: InventoryRecord[] = [];
    let transactions: StockTransaction[] = [];
    let products: Product[] = [];
    service.inventory$.subscribe(value => inventory = value);
    service.transactions$.subscribe(value => transactions = value);
    service.products$.subscribe(value => products = value);

    service.deleteInventory(1);
    expect(inventory.some(item => item.inventoryId === 1)).toBe(false);
    expect(transactions.some(item => item.productId === 1 && item.locationId === 1)).toBe(false);

    service.deleteProduct(1);
    expect(products.some(item => item.productId === 1)).toBe(false);
    expect(inventory.some(item => item.productId === 1)).toBe(false);
    expect(transactions.some(item => item.productId === 1)).toBe(false);
  });
});
