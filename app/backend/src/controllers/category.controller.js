import * as categoryService from '../services/category.service.js';
import { StatusCodes } from 'http-status-codes';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
