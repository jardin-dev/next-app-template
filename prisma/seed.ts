import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Créer un administrateur
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@depotpain.fr' },
    update: {},
    create: {
      email: 'admin@depotpain.fr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Système',
      role: 'ADMIN',
      phone: '01 23 45 67 89',
      address: '1 Rue de la Mairie',
    },
  });
  console.log('✅ Administrateur créé:', admin.email);

  // Créer un client de test
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.fr' },
    update: {},
    create: {
      email: 'client@example.fr',
      password: clientPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'CLIENT',
      phone: '06 12 34 56 78',
      address: '10 Rue du Village',
    },
  });
  console.log('✅ Client de test créé:', client.email);

  // Créer les boutiques par défaut
  const boulangerieShop = await prisma.shop.upsert({
    where: { name: 'Boulangerie' },
    update: {},
    create: {
      name: 'Boulangerie',
      description: 'Pains frais et viennoiseries artisanales',
    },
  });

  const fleuristeShop = await prisma.shop.upsert({
    where: { name: 'Fleuriste' },
    update: {},
    create: {
      name: 'Fleuriste',
      description: 'Bouquets et compositions florales',
    },
  });

  const boucherieShop = await prisma.shop.upsert({
    where: { name: 'Boucherie' },
    update: {},
    create: {
      name: 'Boucherie',
      description: 'Viandes de qualité et charcuterie',
    },
  });

  // Créer les catégories
  const catPain = await prisma.category.upsert({
    where: { name: 'Pain' },
    update: {},
    create: { name: 'Pain' },
  });

  const catViennoiserie = await prisma.category.upsert({
    where: { name: 'Viennoiserie' },
    update: {},
    create: { name: 'Viennoiserie' },
  });

  // Créer des produits - Pains
  const pains = [
    {
      name: 'Baguette Tradition',
      description: 'Baguette traditionnelle française, croustillante à souhait',
      price: 1.2,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catPain.id,
    },
    {
      name: 'Pain de Campagne',
      description: 'Pain rustique au levain, parfait pour accompagner vos repas',
      price: 3.5,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catPain.id,
    },
    {
      name: 'Pain Complet',
      description: 'Pain aux céréales complètes, riche en fibres',
      price: 2.8,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catPain.id,
    },
    {
      name: 'Pain aux Céréales',
      description: 'Pain moelleux aux graines de tournesol, lin et sésame',
      price: 3.2,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catPain.id,
    },
    {
      name: 'Pain de Seigle',
      description: 'Pain au seigle, saveur authentique',
      price: 3.0,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catPain.id,
    },
    {
      name: 'Ficelle',
      description: 'Petite baguette fine et croustillante',
      price: 0.9,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catPain.id,
    },
  ];

  for (const pain of pains) {
    const product = await prisma.product.upsert({
      where: { id: `pain-${pain.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: { shopId: boulangerieShop.id, categoryId: catPain.id },
      create: {
        id: `pain-${pain.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...pain,
      },
    });
    console.log('✅ Pain créé:', product.name);
  }

  // Créer des produits - Viennoiseries
  const viennoiseries = [
    {
      name: 'Croissant',
      description: 'Croissant au beurre, feuilleté et doré',
      price: 1.3,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catViennoiserie.id,
    },
    {
      name: 'Pain au Chocolat',
      description: 'Viennoiserie feuilletée avec deux barres de chocolat',
      price: 1.4,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catViennoiserie.id,
    },
    {
      name: 'Pain aux Raisins',
      description: 'Viennoiserie roulée avec crème pâtissière et raisins secs',
      price: 1.5,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catViennoiserie.id,
    },
    {
      name: 'Chausson aux Pommes',
      description: 'Feuilleté garni de compote de pommes maison',
      price: 1.8,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catViennoiserie.id,
    },
    {
      name: 'Brioche',
      description: 'Brioche moelleuse et légèrement sucrée',
      price: 2.5,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catViennoiserie.id,
    },
    {
      name: 'Éclair au Chocolat',
      description: 'Pâte à choux garnie de crème pâtissière au chocolat',
      price: 2.2,
      imageUrl: null,
      shopId: boulangerieShop.id,
      categoryId: catViennoiserie.id,
    },
  ];

  for (const viennoiserie of viennoiseries) {
    const product = await prisma.product.upsert({
      where: { id: `viennoiserie-${viennoiserie.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: { shopId: boulangerieShop.id, categoryId: catViennoiserie.id },
      create: {
        id: `viennoiserie-${viennoiserie.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...viennoiserie,
      },
    });
    console.log('✅ Viennoiserie créée:', product.name);
  }

  console.log('🎉 Seeding terminé avec succès !');
  console.log('\n📝 Informations de connexion :');
  console.log('   Admin - Email: admin@depotpain.fr | Mot de passe: admin123');
  console.log('   Client - Email: client@example.fr | Mot de passe: client123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
