import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all products with optional filters
 * @param {Object} query - Query parameters for filtering (limit, page, search, etc.)
 * @returns {Promise<Array>} List of products
 */
export const getAllProducts = async (query) => {
  // Basic implementation - can be extended with pagination/filtering later
  return await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      category: true
    }
  });
};

/**
 * Get product by ID
 * @param {number|string} id - Product ID
 * @returns {Promise<Object|null>} Product detail
 */
export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true
    }
  });
};
