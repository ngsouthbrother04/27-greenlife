import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as categoryController from '../controllers/category.controller.js';
import * as categoryService from '../services/category.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/category.service.js');

describe('Category Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [{ id: 1 }, { id: 2 }];
      categoryService.getAllCategories.mockResolvedValue(mockCategories);

      await categoryController.getCategories(req, res, next);

      expect(categoryService.getAllCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategories
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      categoryService.getAllCategories.mockRejectedValue(error);

      await categoryController.getCategories(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCategory', () => {
    it('should return category by slug', async () => {
      req.params.slug = 'test-slug';
      const mockCategory = { id: 1, slug: 'test-slug' };
      categoryService.getCategoryBySlug.mockResolvedValue(mockCategory);

      await categoryController.getCategory(req, res, next);

      expect(categoryService.getCategoryBySlug).toHaveBeenCalledWith('test-slug');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { category: mockCategory }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('Not found');
      categoryService.getCategoryBySlug.mockRejectedValue(error);

      await categoryController.getCategory(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      req.body = { name: 'New Cat' };
      const mockCategory = { id: 1, name: 'New Cat' };
      categoryService.createCategory.mockResolvedValue(mockCategory);

      await categoryController.createCategory(req, res, next);

      expect(categoryService.createCategory).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Category created successfully',
        data: { category: mockCategory }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      categoryService.createCategory.mockRejectedValue(error);

      await categoryController.createCategory(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated' };
      const mockCategory = { id: 1, name: 'Updated' };
      categoryService.updateCategory.mockResolvedValue(mockCategory);

      await categoryController.updateCategory(req, res, next);

      expect(categoryService.updateCategory).toHaveBeenCalledWith('1', req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Category updated successfully',
        data: { category: mockCategory }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      categoryService.updateCategory.mockRejectedValue(error);

      await categoryController.updateCategory(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      req.params.id = '1';
      categoryService.deleteCategory.mockResolvedValue();

      await categoryController.deleteCategory(req, res, next);

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Category deleted successfully'
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      categoryService.deleteCategory.mockRejectedValue(error);

      await categoryController.deleteCategory(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
