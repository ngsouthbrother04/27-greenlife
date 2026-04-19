import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const prisma = new PrismaClient();

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
};

export const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        take: 10
      }
    }
  });

  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  return category;
};

export const createCategory = async (data) => {
  const { name, slug, description } = data;
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new ApiError(StatusCodes.BAD_REQUEST, 'Category slug already exists');

  return await prisma.category.create({
    data: { name, slug, description }
  });
};

export const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');

  return await prisma.category.update({
    where: { id: Number(id) },
    data
  });
};

export const deleteCategory = async (id) => {
  const categoryId = Number(id);
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          products: true,
          children: true
        }
      }
    }
  });
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');

  if (category._count.products > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không thể xóa danh mục khi vẫn còn sản phẩm. Vui lòng chuyển hết sản phẩm sang danh mục khác trước.'
    );
  }

  return await prisma.$transaction(async (tx) => {
    if (category._count.children > 0) {
      await tx.category.updateMany({
        where: { parentId: categoryId },
        data: { parentId: null }
      });
    }

    return tx.category.delete({
      where: { id: categoryId }
    });
  });
};

export const reassignCategoryProducts = async (sourceCategoryId, targetCategoryId) => {
  const fromId = Number(sourceCategoryId);
  const toId = Number(targetCategoryId);

  if (!fromId || !toId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu danh mục nguồn hoặc danh mục đích');
  }

  if (fromId === toId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Danh mục đích phải khác danh mục hiện tại');
  }

  const [sourceCategory, targetCategory] = await Promise.all([
    prisma.category.findUnique({ where: { id: fromId } }),
    prisma.category.findUnique({ where: { id: toId } })
  ]);

  if (!sourceCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy danh mục nguồn');
  }

  if (!targetCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy danh mục đích');
  }

  const result = await prisma.product.updateMany({
    where: { categoryId: fromId },
    data: { categoryId: toId }
  });

  return {
    movedCount: result.count,
    sourceCategory,
    targetCategory
  };
};
