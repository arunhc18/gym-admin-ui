import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  CategoryRequest,
  InventoryRecord,
  Product,
  ProductCategory,
  ProductLocation,
  ProductRequest,
  StockTransaction,
  StockTransactionRequest
} from '../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductService {


  // =====================================================
  // TEMPORARY LOCATION LOOKUP
  //
  // Replace this with LocationService / backend API
  // when the locations module is connected.
  // =====================================================

  private readonly locations:
    ProductLocation[] = [

      {
        locationId: 1,
        tenantId: 1,
        locationName: 'Main Branch'
      },

      {
        locationId: 2,
        tenantId: 1,
        locationName: 'Indiranagar Branch'
      },

      {
        locationId: 3,
        tenantId: 2,
        locationName: 'Iron House Central'
      },

      {
        locationId: 4,
        tenantId: 3,
        locationName: 'FitZone Main'
      }

    ];


  // =====================================================
  // CATEGORIES
  // =====================================================

  private readonly categoriesSubject =
    new BehaviorSubject<ProductCategory[]>([

      {
        categoryId: 1,
        tenantId: 1,
        categoryName: 'Supplements',
        description: 'Nutrition and supplements',
        parentCategoryId: null,
        isActive: true
      },

      {
        categoryId: 2,
        tenantId: 1,
        categoryName: 'Merchandise',
        description: 'Gym branded merchandise',
        parentCategoryId: null,
        isActive: true
      },

      {
        categoryId: 3,
        tenantId: 1,
        categoryName: 'Protein Supplements',
        description: 'Protein products',
        parentCategoryId: 1,
        isActive: true
      },

      {
        categoryId: 4,
        tenantId: 2,
        categoryName: 'Supplements',
        description: null,
        parentCategoryId: null,
        isActive: true
      },

      {
        categoryId: 5,
        tenantId: 3,
        categoryName: 'Gym Accessories',
        description: null,
        parentCategoryId: null,
        isActive: true
      }

    ]);


  // =====================================================
  // PRODUCTS
  // =====================================================

  private readonly productsSubject =
    new BehaviorSubject<Product[]>([

      {
        productId: 1,
        tenantId: 1,
        categoryId: 3,
        productName: 'Whey Protein 1 KG',
        productCode: 'PRD-WHEY-001',
        description: 'Premium whey protein',
        barcode: '8901234567890',
        productType: 'supplement',
        unitOfMeasure: 'Unit',
        sellingPrice: 2499,
        costPrice: 1850,
        taxPercentage: 18,
        minStockLevel: 5,
        maxStockLevel: 50,
        imageUrl: null,
        isActive: true
      },

      {
        productId: 2,
        tenantId: 1,
        categoryId: 2,
        productName: 'Gym T-Shirt',
        productCode: 'PRD-TSHIRT-001',
        description: 'Gym branded T-Shirt',
        barcode: '8901234567891',
        productType: 'merchandise',
        unitOfMeasure: 'Piece',
        sellingPrice: 799,
        costPrice: 420,
        taxPercentage: 5,
        minStockLevel: 10,
        maxStockLevel: 100,
        imageUrl: null,
        isActive: true
      },

      {
        productId: 3,
        tenantId: 2,
        categoryId: 4,
        productName: 'Energy Drink',
        productCode: 'PRD-DRINK-001',
        description: null,
        barcode: null,
        productType: 'consumable',
        unitOfMeasure: 'Bottle',
        sellingPrice: 120,
        costPrice: 70,
        taxPercentage: 18,
        minStockLevel: 20,
        maxStockLevel: 200,
        imageUrl: null,
        isActive: true
      }

    ]);


  // =====================================================
  // INVENTORY
  // =====================================================

  private readonly inventorySubject =
    new BehaviorSubject<InventoryRecord[]>([

      {
        inventoryId: 1,
        locationId: 1,
        productId: 1,
        quantityOnHand: 24,
        quantityReserved: 3,
        quantityAvailable: 21,
        lastRestockDate: '2026-09-25'
      },

      {
        inventoryId: 2,
        locationId: 2,
        productId: 1,
        quantityOnHand: 8,
        quantityReserved: 2,
        quantityAvailable: 6,
        lastRestockDate: '2026-09-26'
      },

      {
        inventoryId: 3,
        locationId: 1,
        productId: 2,
        quantityOnHand: 7,
        quantityReserved: 1,
        quantityAvailable: 6,
        lastRestockDate: '2026-09-22'
      },

      {
        inventoryId: 4,
        locationId: 3,
        productId: 3,
        quantityOnHand: 55,
        quantityReserved: 5,
        quantityAvailable: 50,
        lastRestockDate: '2026-09-28'
      }

    ]);


  // =====================================================
  // STOCK TRANSACTIONS
  // =====================================================

  private readonly transactionsSubject =
    new BehaviorSubject<StockTransaction[]>([

      {
        transactionId: 1,
        locationId: 1,
        productId: 1,
        transactionType: 'in',
        quantity: 20,
        referenceType: 'purchase',
        referenceId: 1001,
        transactionDate:
          '2026-09-25T10:30:00+05:30',
        notes: 'Supplier restock',
        createdBy: 1
      },

      {
        transactionId: 2,
        locationId: 1,
        productId: 2,
        transactionType: 'out',
        quantity: 2,
        referenceType: 'sale',
        referenceId: 2001,
        transactionDate:
          '2026-09-30T17:15:00+05:30',
        notes: 'POS sale',
        createdBy: 1
      }

    ]);


  readonly categories$ =
    this.categoriesSubject
      .asObservable();

  readonly products$ =
    this.productsSubject
      .asObservable();

  readonly inventory$ =
    this.inventorySubject
      .asObservable();

  readonly transactions$ =
    this.transactionsSubject
      .asObservable();


  // =====================================================
  // LOCATIONS
  // =====================================================

  getLocations():
    ProductLocation[] {

    return [
      ...this.locations
    ];

  }


  // =====================================================
  // CATEGORY CRUD
  // =====================================================

  createCategory(
    request: CategoryRequest
  ): ProductCategory {

    this.validateCategoryRequest(request);


    const categories =
      this.categoriesSubject.value;


    const nextId =
      this.nextId(
        categories.map(
          category =>
            category.categoryId
        )
      );


    const now =
      new Date()
        .toISOString();


    const category:
      ProductCategory = {

      categoryId:
        nextId,

      ...request,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.categoriesSubject.next([
      ...categories,
      category
    ]);


    return category;

  }


  updateCategory(
    categoryId: number,
    request: CategoryRequest
  ): ProductCategory | null {

    const categories =
      this.categoriesSubject.value;


    const index =
      categories.findIndex(
        category =>
          category.categoryId ===
          categoryId
      );


    if (index === -1) {
      return null;
    }


    if (
      request.parentCategoryId ===
      categoryId
    ) {

      throw new Error(
        'A category cannot be its own parent.'
      );

    }


    this.validateCategoryRequest(request, categoryId);


    if (
      request.parentCategoryId &&
      this.wouldCreateCategoryCycle(
        categoryId,
        request.parentCategoryId
      )
    ) {

      throw new Error(
        'This parent category would create a category hierarchy cycle.'
      );

    }


    const updated:
      ProductCategory = {

      ...categories[index],

      ...request,

      categoryId,

      updatedAt:
        new Date()
          .toISOString()

    };


    const next =
      [...categories];


    next[index] =
      updated;


    this.categoriesSubject.next(
      next
    );


    return updated;

  }


  setCategoryActiveStatus(
    categoryId: number,
    isActive: boolean
  ): void {

    this.categoriesSubject.next(

      this.categoriesSubject.value.map(
        category =>

          category.categoryId ===
            categoryId

            ? {
                ...category,
                isActive,
                updatedAt:
                  new Date()
                    .toISOString()
              }

            : category

      )

    );

  }


  deleteCategory(categoryId: number): void {

    if (this.productsSubject.value.some(product => product.categoryId === categoryId)) {
      throw new Error('Move or remove products in this category before deleting it.');
    }

    if (this.categoriesSubject.value.some(category => category.parentCategoryId === categoryId)) {
      throw new Error('Move or remove child categories before deleting this category.');
    }

    this.categoriesSubject.next(
      this.categoriesSubject.value.filter(category => category.categoryId !== categoryId)
    );

  }


  // =====================================================
  // PRODUCT CRUD
  // =====================================================

  createProduct(
    request: ProductRequest
  ): Product {

    this.validateProductRequest(request);


    if (
      this.isProductCodeTaken(
        request.tenantId,
        request.productCode
      )
    ) {

      throw new Error(
        'Product code already exists for this tenant.'
      );

    }


    const products =
      this.productsSubject.value;


    const nextId =
      this.nextId(
        products.map(
          product =>
            product.productId
        )
      );


    const now =
      new Date()
        .toISOString();


    const product:
      Product = {

      productId:
        nextId,

      ...request,

      productName:
        request.productName.trim(),

      productCode:
        request.productCode
          .trim()
          .toUpperCase(),

      createdAt:
        now,

      updatedAt:
        now

    };


    this.productsSubject.next([
      ...products,
      product
    ]);


    return product;

  }


  updateProduct(
    productId: number,
    request: ProductRequest
  ): Product | null {

    const products =
      this.productsSubject.value;


    const index =
      products.findIndex(
        product =>
          product.productId ===
          productId
      );


    if (index === -1) {
      return null;
    }


    this.validateProductRequest(request, productId);


    if (
      this.isProductCodeTaken(
        request.tenantId,
        request.productCode,
        productId
      )
    ) {

      throw new Error(
        'Product code already exists for this tenant.'
      );

    }


    const updated:
      Product = {

      ...products[index],

      ...request,

      productId,

      productName:
        request.productName.trim(),

      productCode:
        request.productCode
          .trim()
          .toUpperCase(),

      updatedAt:
        new Date()
          .toISOString()

    };


    const next =
      [...products];


    next[index] =
      updated;


    this.productsSubject.next(
      next
    );


    return updated;

  }


  setProductActiveStatus(
    productId: number,
    isActive: boolean
  ): void {

    this.productsSubject.next(

      this.productsSubject.value.map(
        product =>

          product.productId ===
            productId

            ? {
                ...product,
                isActive,
                updatedAt:
                  new Date()
                    .toISOString()
              }

            : product

      )

    );

  }


  deleteProduct(productId: number): void {

    this.productsSubject.next(
      this.productsSubject.value.filter(product => product.productId !== productId)
    );
    this.inventorySubject.next(
      this.inventorySubject.value.filter(item => item.productId !== productId)
    );
    this.transactionsSubject.next(
      this.transactionsSubject.value.filter(item => item.productId !== productId)
    );

  }


  isProductCodeTaken(
    tenantId: number,
    productCode: string,
    excludeProductId?: number
  ): boolean {

    const normalized =
      productCode
        .trim()
        .toLowerCase();


    return this.productsSubject
      .value
      .some(
        product =>

          product.tenantId ===
            tenantId &&

          product.productCode
            .trim()
            .toLowerCase() ===
            normalized &&

          product.productId !==
            excludeProductId

      );

  }


  // =====================================================
  // STOCK TRANSACTION
  // =====================================================

  recordStockTransaction(
    request: StockTransactionRequest
  ): StockTransaction {

    this.validateStockTransactionRequest(request);

    const product =
      this.productsSubject
        .value
        .find(
          item =>
            item.productId ===
            request.productId
        );


    if (!product) {

      throw new Error(
        'Product was not found.'
      );

    }


    const location =
      this.locations.find(
        item =>
          item.locationId ===
          request.locationId
      );


    if (!location) {

      throw new Error(
        'Location was not found.'
      );

    }


    if (
      location.tenantId !==
      product.tenantId
    ) {

      throw new Error(
        'Product and location must belong to the same tenant.'
      );

    }


    if (
      request.transactionType !==
        'adjustment' &&
      request.quantity <= 0
    ) {

      throw new Error(
        'Quantity must be greater than zero.'
      );

    }


    if (
      request.transactionType ===
        'adjustment' &&
      request.quantity === 0
    ) {

      throw new Error(
        'Adjustment quantity cannot be zero.'
      );

    }


    const inventory =
      this.inventorySubject.value;


    const existing =
      inventory.find(
        item =>

          item.locationId ===
            request.locationId &&

          item.productId ===
            request.productId

      );


    const currentOnHand =
      existing
        ?.quantityOnHand ??
      0;


    const reserved =
      existing
        ?.quantityReserved ??
      0;


    let delta = 0;


    switch (
      request.transactionType
    ) {

      case 'in':
      case 'return':

        delta =
          request.quantity;

        break;


      case 'out':

        delta =
          -request.quantity;

        break;


      case 'adjustment':

        /*
         * Adjustment quantity is treated as
         * a signed difference:
         *
         * +5 adds five
         * -3 removes three
         */

        delta =
          request.quantity;

        break;

    }


    const newOnHand =
      currentOnHand +
      delta;


    if (
      newOnHand < reserved
    ) {

      throw new Error(
        'Stock cannot be reduced below the reserved quantity.'
      );

    }


    const now =
      new Date()
        .toISOString();


    const today =
      now.substring(
        0,
        10
      );


    if (existing) {

      this.inventorySubject.next(

        inventory.map(
          item =>

            item.inventoryId ===
              existing.inventoryId

              ? {

                  ...item,

                  quantityOnHand:
                    newOnHand,

                  quantityAvailable:
                    newOnHand -
                    reserved,

                  lastRestockDate:
                    request.transactionType ===
                      'in'

                      ? today

                      : item.lastRestockDate,

                  updatedAt:
                    now

                }

              : item

        )

      );

    } else {

      const inventoryId =
        this.nextId(
          inventory.map(
            item =>
              item.inventoryId
          )
        );


      this.inventorySubject.next([

        ...inventory,

        {
          inventoryId,

          locationId:
            request.locationId,

          productId:
            request.productId,

          quantityOnHand:
            newOnHand,

          quantityReserved:
            0,

          quantityAvailable:
            newOnHand,

          lastRestockDate:
            request.transactionType ===
              'in'

              ? today

              : null,

          createdAt:
            now,

          updatedAt:
            now
        }

      ]);

    }


    const transactions =
      this.transactionsSubject.value;


    const transaction:
      StockTransaction = {

      transactionId:
        this.nextId(
          transactions.map(
            item =>
              item.transactionId
          )
        ),

      ...request,

      transactionDate:
        now,

      /*
       * Temporary demo user.
       *
       * Backend must use authenticated
       * users.user_id.
       */
      createdBy:
        1,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.transactionsSubject.next([
      transaction,
      ...transactions
    ]);


    return transaction;

  }


  updateInventoryQuantity(
    inventoryId: number,
    quantityOnHand: number
  ): InventoryRecord {

    const inventory = this.inventorySubject.value.find(
      item => item.inventoryId === inventoryId
    );

    if (!inventory) {
      throw new Error('Inventory record was not found.');
    }

    if (!Number.isInteger(quantityOnHand) || quantityOnHand < inventory.quantityReserved) {
      throw new Error('On-hand quantity must be a whole number and cannot be below reserved stock.');
    }

    const adjustment = quantityOnHand - inventory.quantityOnHand;
    if (adjustment !== 0) {
      this.recordStockTransaction({
        locationId: inventory.locationId,
        productId: inventory.productId,
        transactionType: 'adjustment',
        quantity: adjustment,
        referenceType: 'adjustment',
        referenceId: inventoryId,
        notes: 'Inventory quantity edited'
      });
    }

    return { ...inventory, quantityOnHand, quantityAvailable: quantityOnHand - inventory.quantityReserved };

  }


  deleteInventory(inventoryId: number): void {

    const inventory = this.inventorySubject.value.find(
      item => item.inventoryId === inventoryId
    );

    if (!inventory) {
      return;
    }

    this.inventorySubject.next(
      this.inventorySubject.value.filter(item => item.inventoryId !== inventoryId)
    );
    this.transactionsSubject.next(
      this.transactionsSubject.value.filter(item =>
        item.locationId !== inventory.locationId || item.productId !== inventory.productId
      )
    );

  }


  updateStockTransaction(
    transactionId: number,
    request: StockTransactionRequest
  ): StockTransaction {

    const existing = this.transactionsSubject.value.find(
      item => item.transactionId === transactionId
    );

    if (!existing) {
      throw new Error('Stock transaction was not found.');
    }

    if (request.productId !== existing.productId || request.locationId !== existing.locationId) {
      throw new Error('Product and location cannot be changed when editing a transaction.');
    }

    this.validateStockTransactionRequest(request);

    const inventory = this.inventorySubject.value.find(
      item => item.productId === existing.productId && item.locationId === existing.locationId
    );

    if (!inventory) {
      throw new Error('Inventory record was not found for this transaction.');
    }

    const oldDelta = this.stockDelta(existing.transactionType, existing.quantity);
    const newDelta = this.stockDelta(request.transactionType, request.quantity);
    const quantityOnHand = inventory.quantityOnHand - oldDelta + newDelta;

    if (quantityOnHand < inventory.quantityReserved) {
      throw new Error('This edit would reduce stock below the reserved quantity.');
    }

    this.inventorySubject.next(
      this.inventorySubject.value.map(item => item.inventoryId === inventory.inventoryId
        ? { ...item, quantityOnHand, quantityAvailable: quantityOnHand - item.quantityReserved, updatedAt: new Date().toISOString() }
        : item
      )
    );

    const updated: StockTransaction = {
      ...existing,
      ...request,
      transactionId,
      updatedAt: new Date().toISOString()
    };

    this.transactionsSubject.next(
      this.transactionsSubject.value.map(item => item.transactionId === transactionId ? updated : item)
    );

    return updated;

  }


  deleteStockTransaction(transactionId: number): void {

    const transaction = this.transactionsSubject.value.find(
      item => item.transactionId === transactionId
    );

    if (!transaction) {
      return;
    }

    const inventory = this.inventorySubject.value.find(
      item => item.productId === transaction.productId && item.locationId === transaction.locationId
    );

    if (!inventory) {
      throw new Error('Inventory record was not found for this transaction.');
    }

    const quantityOnHand = inventory.quantityOnHand - this.stockDelta(
      transaction.transactionType,
      transaction.quantity
    );

    if (quantityOnHand < inventory.quantityReserved) {
      throw new Error('This transaction cannot be deleted because stock is now reserved.');
    }

    this.inventorySubject.next(
      this.inventorySubject.value.map(item => item.inventoryId === inventory.inventoryId
        ? { ...item, quantityOnHand, quantityAvailable: quantityOnHand - item.quantityReserved, updatedAt: new Date().toISOString() }
        : item
      )
    );

    this.transactionsSubject.next(
      this.transactionsSubject.value.filter(item => item.transactionId !== transactionId)
    );

  }


  // =====================================================
  // PRIVATE VALIDATION
  // =====================================================

  private validateCategoryRequest(
    request: CategoryRequest,
    excludeCategoryId?: number
  ): void {

    const name = request.categoryName?.trim() ?? '';
    if (!Number.isInteger(request.tenantId) || !this.locations.some(location => location.tenantId === request.tenantId)) {
      throw new Error('Select a valid tenant.');
    }
    if (name.length < 2 || name.length > 100) {
      throw new Error('Category name must contain between 2 and 100 characters.');
    }
    if ((request.description?.length ?? 0) > 500) {
      throw new Error('Category description cannot exceed 500 characters.');
    }
    if (request.parentCategoryId != null && (!Number.isInteger(request.parentCategoryId) || request.parentCategoryId < 1)) {
      throw new Error('Select a valid parent category.');
    }
    if (this.categoriesSubject.value.some(category =>
      category.categoryId !== excludeCategoryId &&
      category.tenantId === request.tenantId &&
      category.categoryName.trim().toLowerCase() === name.toLowerCase()
    )) {
      throw new Error('A category with this name already exists for the tenant.');
    }

    this.validateParentCategory(request.tenantId, request.parentCategoryId);

  }


  private validateProductRequest(
    request: ProductRequest,
    excludeProductId?: number
  ): void {

    const name = request.productName?.trim() ?? '';
    const productCode = request.productCode?.trim() ?? '';
    if (!Number.isInteger(request.tenantId) || !this.locations.some(location => location.tenantId === request.tenantId)) {
      throw new Error('Select a valid tenant.');
    }
    if (name.length < 2 || name.length > 100) {
      throw new Error('Product name must contain between 2 and 100 characters.');
    }
    if (!/^[A-Za-z0-9_-]{2,50}$/.test(productCode)) {
      throw new Error('Product code must be 2 to 50 letters, numbers, hyphens or underscores.');
    }
    if (!Number.isFinite(request.sellingPrice) || request.sellingPrice < 0) {
      throw new Error('Selling price must be zero or greater.');
    }
    if (request.costPrice != null && (!Number.isFinite(request.costPrice) || request.costPrice < 0)) {
      throw new Error('Cost price must be zero or greater.');
    }
    if (!Number.isFinite(request.taxPercentage) || request.taxPercentage < 0 || request.taxPercentage > 100) {
      throw new Error('Tax percentage must be between 0 and 100.');
    }
    if (!Number.isInteger(request.minStockLevel) || request.minStockLevel < 0) {
      throw new Error('Minimum stock level must be a whole number of zero or greater.');
    }
    if (request.maxStockLevel != null && (!Number.isInteger(request.maxStockLevel) || request.maxStockLevel < request.minStockLevel)) {
      throw new Error('Maximum stock level must be a whole number at least as large as the minimum.');
    }
    if ((request.description?.length ?? 0) > 1000 || (request.unitOfMeasure?.trim().length ?? 0) > 50) {
      throw new Error('Description or unit of measure exceeds the allowed length.');
    }

    this.validateProductCategory(request.tenantId, request.categoryId);

    if (this.isProductCodeTaken(request.tenantId, productCode, excludeProductId)) {
      throw new Error('Product code already exists for this tenant.');
    }

  }


  private validateStockTransactionRequest(request: StockTransactionRequest): void {

    const product = this.productsSubject.value.find(item => item.productId === request.productId);
    const location = this.locations.find(item => item.locationId === request.locationId);

    if (!product || !location) {
      throw new Error('Select a valid product and location.');
    }
    if (product.tenantId !== location.tenantId) {
      throw new Error('Product and location must belong to the same tenant.');
    }
    if (!Number.isInteger(request.quantity)) {
      throw new Error('Quantity must be a whole number.');
    }
    if (request.transactionType === 'adjustment' ? request.quantity === 0 : request.quantity <= 0) {
      throw new Error(request.transactionType === 'adjustment'
        ? 'Adjustment quantity cannot be zero.'
        : 'Quantity must be greater than zero.');
    }
    if ((request.notes?.length ?? 0) > 500) {
      throw new Error('Notes cannot exceed 500 characters.');
    }
    if (request.referenceId != null && (!Number.isInteger(request.referenceId) || request.referenceId < 1)) {
      throw new Error('Reference ID must be a positive whole number.');
    }

  }


  private stockDelta(
    transactionType: StockTransaction['transactionType'],
    quantity: number
  ): number {
    return transactionType === 'out' ? -quantity : quantity;
  }

  private validateProductCategory(
    tenantId: number,
    categoryId?: number | null
  ): void {

    if (!categoryId) {
      return;
    }


    const category =
      this.categoriesSubject
        .value
        .find(
          item =>
            item.categoryId ===
            categoryId
        );


    if (
      !category ||
      category.tenantId !==
        tenantId
    ) {

      throw new Error(
        'Category must belong to the same tenant as the product.'
      );

    }

  }


  private validateParentCategory(
    tenantId: number,
    parentCategoryId?: number | null
  ): void {

    if (!parentCategoryId) {
      return;
    }


    const parent =
      this.categoriesSubject
        .value
        .find(
          category =>
            category.categoryId ===
            parentCategoryId
        );


    if (
      !parent ||
      parent.tenantId !==
        tenantId
    ) {

      throw new Error(
        'Parent category must belong to the same tenant.'
      );

    }

  }


  private wouldCreateCategoryCycle(
    categoryId: number,
    parentCategoryId: number
  ): boolean {

    const categories =
      this.categoriesSubject.value;


    let currentId:
      number | null =
      parentCategoryId;


    while (currentId) {

      if (
        currentId ===
        categoryId
      ) {

        return true;

      }


      currentId =
        categories.find(
          category =>
            category.categoryId ===
            currentId
        )
          ?.parentCategoryId ??
        null;

    }


    return false;

  }


  private nextId(
    ids: number[]
  ): number {

    return (
      ids.length === 0

        ? 1

        : Math.max(
            ...ids
          ) + 1
    );

  }

}