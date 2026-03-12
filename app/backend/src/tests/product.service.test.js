import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      product: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      category: {
        findUnique: vi.fn()
      },
      orderItem: {
        groupBy: vi.fn()
      }
    }
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function() {
      return mockPrisma;
    }
  };
});

import * as productService from '../services/product.service.js';

describe('Product Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return paginated products with basic defaults', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await productService.getAllProducts({});
      expect(result.products).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        skip: 0,
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      });
    });

    it('should search products by name', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await productService.getAllProducts({ search: 'apple' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: 'apple', mode: 'insensitive' }
        })
      }));
    });

    it('should search by numeric categoryId', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await productService.getAllProducts({ categoryId: '5' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ categoryId: 5 })
      }));
    });

    it('should search by category slug successfully', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.category.findUnique.mockResolvedValue({ id: 10 }); // Found slug mapping to ID 10

      await productService.getAllProducts({ categoryId: 'fruits' });
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({ where: { slug: 'fruits' } });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ categoryId: 10 })
      }));
    });

    it('should handle unmapped category slug by searching for impossible ID', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.category.findUnique.mockResolvedValue(null); // Not found

      await productService.getAllProducts({ categoryId: 'unknown' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ categoryId: -1 })
      }));
    });
    
    it('should filter by price range', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await productService.getAllProducts({ minPrice: '10', maxPrice: '50' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          price: { gte: 10, lte: 50 }
        })
      }));
    });

    it('should apply valid sorting options', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const testCases = [
        { key: 'price_asc', expected: { price: 'asc' } },
        { key: 'price_desc', expected: { price: 'desc' } },
        { key: 'name_asc', expected: { name: 'asc' } },
        { key: 'unknown', expected: { createdAt: 'desc' } }
      ];

      for (const t of testCases) {
        await productService.getAllProducts({ sort: t.key });
        expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
          orderBy: t.expected
        }));
      }
    });
  });

  describe('getTopSellingProducts', () => {
    it('should return top selling products fetched using OrderItem grouping', async () => {
      mockPrisma.orderItem.groupBy.mockResolvedValue([
        { productId: 2, _sum: { quantity: 10 } },
        { productId: 1, _sum: { quantity: 5 } }
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 1, name: 'Prod 1' },
        { id: 2, name: 'Prod 2' }
      ]);

      const result = await productService.getTopSellingProducts(2);
      
      expect(mockPrisma.orderItem.groupBy).toHaveBeenCalledWith({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 2
      });

      // Output should follow the order from groupBy: Product 2 then Product 1
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(1);
    });

    it('should fill with recent products if top sales list is smaller than limit', async () => {
      mockPrisma.orderItem.groupBy.mockResolvedValue([
        { productId: 2, _sum: { quantity: 10 } }
      ]);
      mockPrisma.product.findMany
        .mockResolvedValueOnce([{ id: 2, name: 'Prod 2' }]) // for productIds from groupBy
        .mockResolvedValueOnce([{ id: 3, name: 'Recent' }]); // for fill
      
      const result = await productService.getTopSellingProducts(2);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(3);
    });
  });

  describe('getProductById', () => {
    it('should return product details when found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      const product = await productService.getProductById(1);
      expect(product.id).toBe(1);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
    });

    it('should throw NOT FOUND error when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(productService.getProductById(99)).rejects.toThrow(ApiError);
    });
  });

  describe('createProduct', () => {
    it('should create product with autogenerated slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null); // No slug conflict
      mockPrisma.product.create.mockResolvedValue({ id: 1, name: 'Test Product', slug: 'test-product' });

      const result = await productService.createProduct({ name: 'Test Product' });
      
      expect(result.id).toBe(1);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ slug: 'test-product' })
      });
    });

    it('should append counter to slug if it already exists', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce({ id: 9 }) // First try: slug 'test' exists
        .mockResolvedValueOnce(null); // Second try: slug 'test-1' is free
      
      mockPrisma.product.create.mockResolvedValue({ id: 1 });

      await productService.createProduct({ name: 'Test' });
      
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ slug: 'test-1' })
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.product.update.mockResolvedValue({ id: 1, name: 'Updated' });

      const result = await productService.updateProduct(1, { name: 'Updated' });
      
      expect(result.name).toBe('Updated');
    });

    it('should throw NOT FOUND if product does not exist before update', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(productService.updateProduct(99, {})).rejects.toThrow(ApiError);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product by setting status to INACTIVE', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.product.update.mockResolvedValue({ id: 1, status: 'INACTIVE' });

      const result = await productService.deleteProduct(1);
      
      expect(result.status).toBe('INACTIVE');
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'INACTIVE' }
      });
    });

    it('should throw NOT FOUND if product does not exist before delete', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(productService.deleteProduct(99)).rejects.toThrow(ApiError);
    });
  });
});
