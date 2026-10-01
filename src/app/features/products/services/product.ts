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

    this.validateParentCategory(
      request.tenantId,
      request.parentCategoryId
    );


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


    this.validateParentCategory(
      request.tenantId,
      request.parentCategoryId
    );


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


  // =====================================================
  // PRODUCT CRUD
  // =====================================================

  createProduct(
    request: ProductRequest
  ): Product {

    this.validateProductCategory(
      request.tenantId,
      request.categoryId
    );


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


    this.validateProductCategory(
      request.tenantId,
      request.categoryId
    );


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


  // =====================================================
  // PRIVATE VALIDATION
  // =====================================================

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