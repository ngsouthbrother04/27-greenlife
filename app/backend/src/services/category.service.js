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
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');

  return await prisma.category.delete({
    where: { id: Number(id) }
  });
};
