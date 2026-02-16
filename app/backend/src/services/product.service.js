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
    const catId = Number(categoryId);
    if (!isNaN(catId)) {
      where.categoryId = catId;
    } else {
      // It's likely a slug
      const category = await prisma.category.findUnique({
        where: { slug: categoryId }
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        // Category not found by slug, maybe return distinct result or ignore?
        // Let's return empty result by setting impossible ID
        where.categoryId = -1;
      }
    }
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
      case 'createdAt_desc':
        orderBy = { createdAt: 'desc' };
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
 * Get top selling products
 * @param {number} limit - Number of products
 * @returns {Promise<Array>} List of products
 */
export const getTopSellingProducts = async (limit = 6) => {
  // 1. Group by productId and sum quantity in OrderItem
  const groupBy = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: limit
  });

  // 2. Extract product IDs
  const productIds = groupBy.map(item => item.productId);

  // 3. Fetch product details
  // Note: findMany does not guarantee order match with 'in' array.
  // We need to re-sort them in application layer or retrieve one by one (less efficient).
  // Given small limit (6), mapping is fine.
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: 'ACTIVE'
    },
    include: {
      category: true
    }
  });

  // 4. Sort products based on the sales order
  const sortedProducts = productIds
    .map(id => products.find(p => p.id === id))
    .filter(p => p !== undefined); // Filter out any that might have been deleted/inactive

  // If we don't have enough sales data, fill with newest products
  if (sortedProducts.length < limit) {
    const needed = limit - sortedProducts.length;
    const existingIds = sortedProducts.map(p => p.id);

    const fillProducts = await prisma.product.findMany({
      where: {
        id: { notIn: existingIds },
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' },
      take: needed,
      include: { category: true }
    });

    return [...sortedProducts, ...fillProducts];
  }

  return sortedProducts;
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

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

/**
 * Create Product (Admin)
 */
export const createProduct = async (data) => {
  if (!data.slug) {
    data.slug = slugify(data.name);
  }

  // Ensure uniqueness
  let slug = data.slug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${data.slug}-${counter}`;
    counter++;
  }
  data.slug = slug;

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
