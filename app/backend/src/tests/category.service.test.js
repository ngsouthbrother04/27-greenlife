import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      category: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
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

import * as categoryService from '../services/category.service.js';

describe('Category Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories with product count', async () => {
      const mockData = [{ id: 1, name: 'Fruits', _count: { products: 5 } }];
      mockPrisma.category.findMany.mockResolvedValue(mockData);

      const result = await categoryService.getAllCategories();
      expect(result).toEqual(mockData);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { products: true } } }
      });
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category with up to 10 active products', async () => {
      const mockCategory = { id: 1, slug: 'test', products: [] };
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryBySlug('test');
      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test' },
        include: {
          products: {
            where: { status: 'ACTIVE' },
            take: 10
          }
        }
      });
    });

    it('should throw NOT FOUND if category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(categoryService.getCategoryBySlug('unknown')).rejects.toThrow(ApiError);
      
      try {
        await categoryService.getCategoryBySlug('unknown');
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.NOT_FOUND);
      }
    });
  });

  describe('createCategory', () => {
    const validData = { name: 'Test', slug: 'test', description: 'Desc' };

    it('should create new category', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue({ id: 1, ...validData });

      const result = await categoryService.createCategory(validData);
      expect(result.id).toBe(1);
      expect(result.name).toBe(validData.name);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({ data: validData });
    });

    it('should throw BAD REQUEST if slug exists', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 1 });
      await expect(categoryService.createCategory(validData)).rejects.toThrow(ApiError);

      try {
        await categoryService.createCategory(validData);
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(err.message).toBe('Category slug already exists');
      }
    });
  });

  describe('updateCategory', () => {
    it('should update category', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.category.update.mockResolvedValue({ id: 1, name: 'Updated' });

      const result = await categoryService.updateCategory(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated' }
      });
    });

    it('should throw NOT FOUND if category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(categoryService.updateCategory(99, { name: 'A' })).rejects.toThrow(ApiError);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.category.delete.mockResolvedValue({ id: 1 });

      const result = await categoryService.deleteCategory(1);
      expect(result.id).toBe(1);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NOT FOUND if category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(categoryService.deleteCategory(99)).rejects.toThrow(ApiError);
    });
  });
});
