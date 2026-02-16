import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';

const prisma = new PrismaClient();

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { productId } = req.body;

    if (!productId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Product ID is required');
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId)
        }
      }
    });

    if (existing) {
      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Product already in wishlist',
        data: { wishlist: existing }
      });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        productId: Number(productId)
      }
    });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Product added to wishlist',
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params; // productId

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId: Number(id)
        }
      }
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    // If record doesn't exist, just return success or ignore
    if (error.code === 'P2025') {
      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Product removed from wishlist'
      });
    }
    next(error);
  }
};

/**
 * Get user wishlist
 */
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: wishlist.length,
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if product is in wishlist
 */
export const checkWishlistStatus = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params; // productId

    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: Number(id)
        }
      }
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { isWishlisted: !!item }
    });
  } catch (error) {
    next(error);
  }
};
