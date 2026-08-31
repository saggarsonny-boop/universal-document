const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing Stripe IDs from database to force live sync...');
  await prisma.product.updateMany({
    data: {
      stripeProductId: null,
      stripePriceId: null
    }
  });
  console.log('Stripe IDs cleared successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
