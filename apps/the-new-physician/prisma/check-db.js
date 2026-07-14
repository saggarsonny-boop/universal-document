const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count({
    where: { status: 'live' }
  });
  console.log(`Live products count: ${count}`);
  
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, title: true }
  });
  console.log('Products in database:');
  console.table(products);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
