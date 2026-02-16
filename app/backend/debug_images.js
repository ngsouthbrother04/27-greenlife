
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
    }
  });

  console.log('--- Product Images Debug ---');
  products.forEach(p => {
    console.log(`ID: ${p.id} | Name: ${p.name}`);
    console.log(`Images (${typeof p.images}):`, p.images);
    console.log('---------------------------');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
