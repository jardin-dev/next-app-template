import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Migration des boutiques ---');

  // 1. Créer les boutiques par défaut
  const boulangerie = await prisma.shop.upsert({
    where: { name: 'Boulangerie' },
    update: {},
    create: {
      name: 'Boulangerie',
      description: 'Pains frais et viennoiseries artisanales',
    },
  });
  console.log('Boutique Boulangerie créée/trouvée');

  const fleuriste = await prisma.shop.upsert({
    where: { name: 'Fleuriste' },
    update: {},
    create: {
      name: 'Fleuriste',
      description: 'Bouquets et compositions florales',
    },
  });
  console.log('Boutique Fleuriste créée');

  const boucherie = await prisma.shop.upsert({
    where: { name: 'Boucherie' },
    update: {},
    create: {
      name: 'Boucherie',
      description: 'Viandes de qualité et charcuterie',
    },
  });
  console.log('Boutique Boucherie créée');

  // 2. Assigner tous les produits sans boutique à la Boulangerie
  const result = await prisma.product.updateMany({
    where: { shopId: null },
    data: { shopId: boulangerie.id },
  });

  console.log(`${result.count} produits ont été assignés à la Boulangerie.`);
  console.log('Migration terminée !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
