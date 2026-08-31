const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Backfilling product brands...');

  const roadSlugs = [
    'pre-sentencing-worksheet',
    'questions-to-ask-attorney',
    'collateral-consequences-checklist',
    'first-72-hours-arrest',
    'supervision-compliance-tracker',
    'restitution-payment-tracker',
    'sentencing-walkthrough',
    'self-surrender-bop-prep',
    'halfway-house-reentry-kit',
    'talking-to-kids-case',
    'family-communication-plan',
    'how-to-read-indictment',
    'court-date-deadline-tracker',
    'reentry-resource-case-managers',
    'supervision-officer-quick-reference',
    'road-companion-toolkit' // bundle
  ];

  const clinicalSlugs = [
    'physician-guide-healthcare-fraud-indictment',
    'clinical-plausibility-checklist',
    'physician-expert-declaration-template',
    'medical-record-review-request',
    'credentialing-board-action-defense',
    'non-clinical-pivot-guide',
    'physician-guide-oig-exclusion'
  ];

  // Update Road products
  const roadRes = await prisma.product.updateMany({
    where: {
      slug: { in: roadSlugs }
    },
    data: {
      brand: 'the_road'
    }
  });
  console.log(`Updated ${roadRes.count} products to brand 'the_road'`);

  // Update Clinical products
  const clinicalRes = await prisma.product.updateMany({
    where: {
      slug: { in: clinicalSlugs }
    },
    data: {
      brand: 'clinical'
    }
  });
  console.log(`Updated ${clinicalRes.count} products to brand 'clinical'`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
