import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Get all products with optional filters
 * @param {Object} query - Query parameters for filtering (limit, page, search, etc.)
 * @returns {Promise<Array>} List of products
 */
export const getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    minPrice,
    maxPrice,
    sort
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build Where Clause
  const where = {
    status: 'ACTIVE'
  };

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  // Build OrderBy Clause
  let orderBy = { createdAt: 'desc' }; // Default: Newest

  if (sort) {
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      // 'sold' sorting requires 'sold' field or order aggregation, which is complex.
      // For now, let's assume 'createdAt' desc is fallback.
      default:
        orderBy = { createdAt: 'desc' };
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: true
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

/**
 * Get product by ID
 * @param {number|string} id - Product ID
 * @returns {Promise<Object>} Product detail
 */
export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      reviews: {
        include: {
          user: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  return product;
};

/**
 * Create Product (Admin)
 */
export const createProduct = async (data) => {
  return await prisma.product.create({
    data
  });
};

/**
 * Update Product (Admin)
 */
export const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  return await prisma.product.update({
    where: { id: Number(id) },
    data
  });
};

/**
 * Delete Product (Admin)
 */
export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  // Hard delete or Soft delete? Prompt says "Delete". Let's do hard delete for now, 
  // or set status to INACTIVE if referred. Safe choice: Status INACTIVE.
  return await prisma.product.update({
    where: { id: Number(id) },
    data: { status: 'INACTIVE' }
  });
};
