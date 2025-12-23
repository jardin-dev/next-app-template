# 🥖 Dépôt de Pain - Application de Gestion de Commandes

Application web full-stack de gestion de dépôt de pain pour votre commune, avec système de commande bi-hebdomadaire.

## 📋 Fonctionnalités

### Système de Commande (Cycle bi-hebdomadaire)

- **Cycle 1** : Commande le samedi pour livraison le mercredi suivant
- **Cycle 2** : Commande le mercredi pour livraison le samedi suivant
- Affichage automatique de la prochaine date de livraison
- Indication claire de la date limite de commande

### Gestion des Utilisateurs

- Système d'authentification (Inscription / Connexion)
- Profil utilisateur avec historique des commandes
- Rôles : CLIENT et ADMIN

### Interface Client

- Catalogue des produits (Pains et viennoiseries)
- Panier avec gestion des quantités
- Validation de commande avec récapitulatif
- Historique des commandes

### Interface Administrateur

- Gestion du catalogue (Ajout/Modification/Suppression de produits)
- Vue récapitulative des commandes par date de livraison
- Gestion des utilisateurs
- Tableau de bord

## 🛠️ Stack Technique

- **Frontend** : React 19 + Next.js 16
- **UI Framework** : Mantine UI v8
- **Backend** : Next.js API Routes
- **Database** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : JWT + bcrypt
- **Gestion des dates** : Day.js
- **Icônes** : Tabler Icons

## 📊 Schéma de Base de Données

### Tables principales

#### Users (Utilisateurs)

- `id` : Identifiant unique (CUID)
- `email` : Email unique
- `password` : Mot de passe hashé (bcrypt)
- `firstName`, `lastName` : Nom et prénom
- `phone`, `address` : Coordonnées optionnelles
- `role` : ADMIN ou CLIENT
- `isActive` : Statut du compte
- `createdAt`, `updatedAt` : Dates de création/modification

#### Products (Produits)

- `id` : Identifiant unique (CUID)
- `name` : Nom du produit
- `description` : Description optionnelle
- `category` : PAIN ou VIENNOISERIE
- `price` : Prix unitaire
- `imageUrl` : URL de l'image
- `isAvailable` : Disponibilité
- `stock` : Stock optionnel
- `createdAt`, `updatedAt` : Dates de création/modification

#### Orders (Commandes)

- `id` : Identifiant unique (CUID)
- `orderNumber` : Numéro de commande unique
- `userId` : Référence à l'utilisateur
- `status` : PENDING, CONFIRMED, PREPARING, DELIVERED, CANCELLED
- `deliveryCycle` : CYCLE_1 ou CYCLE_2
- `orderDate` : Date de la commande
- `deliveryDate` : Date de livraison calculée
- `totalAmount` : Montant total
- `notes` : Notes optionnelles
- `createdAt`, `updatedAt` : Dates de création/modification

#### OrderItems (Détails de commande)

- `id` : Identifiant unique (CUID)
- `orderId` : Référence à la commande
- `productId` : Référence au produit
- `quantity` : Quantité commandée
- `unitPrice` : Prix unitaire au moment de la commande
- `subtotal` : Sous-total (quantity × unitPrice)
- `createdAt` : Date de création

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/depot_pain?schema=public"

# JWT Secret (générez une clé sécurisée en production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next Auth (optionnel)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 3. Initialisation de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour gérer les données
npx prisma studio
```

### 4. Création d'un utilisateur administrateur

Vous pouvez créer un administrateur via Prisma Studio ou en utilisant un script :

```bash
# Ouvrir Prisma Studio
npx prisma studio
```

Puis créer un utilisateur avec :

- `role` : ADMIN
- `password` : Hash bcrypt d'un mot de passe (utilisez un outil en ligne ou le script ci-dessous)

### 5. Lancement de l'application

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Utilisation

### Pour les Clients

1. **Inscription** : Créez un compte sur `/login`
2. **Connexion** : Connectez-vous avec vos identifiants
3. **Commander** :
   - Consultez le catalogue de produits
   - Ajoutez des articles au panier
   - Vérifiez la date de livraison
   - Validez votre commande avant la date limite
4. **Suivi** : Consultez l'historique de vos commandes

### Pour les Administrateurs

1. **Connexion** : Connectez-vous avec un compte ADMIN
2. **Gestion des produits** :
   - Ajoutez de nouveaux produits (pains, viennoiseries)
   - Modifiez les prix et descriptions
   - Gérez la disponibilité
3. **Gestion des commandes** :
   - Consultez toutes les commandes
   - Filtrez par date de livraison
   - Exportez les listes pour le boulanger
4. **Gestion des utilisateurs** :
   - Consultez la liste des clients
   - Activez/désactivez des comptes

## 🔄 Logique des Cycles de Livraison

Le système calcule automatiquement la prochaine date de livraison :

### Cycle 1 (Samedi → Mercredi)

- **Période de commande** : Dimanche à Samedi
- **Livraison** : Mercredi suivant

### Cycle 2 (Mercredi → Samedi)

- **Période de commande** : Dimanche à Mercredi
- **Livraison** : Samedi suivant

### Exemple de calendrier

| Jour actuel | Prochaine livraison         | Cycle   | Deadline                 |
| ----------- | --------------------------- | ------- | ------------------------ |
| Dimanche    | Mercredi (même semaine)     | CYCLE_1 | Samedi précédent         |
| Lundi       | Mercredi (même semaine)     | CYCLE_1 | Samedi précédent         |
| Mardi       | Mercredi (même semaine)     | CYCLE_1 | Samedi précédent         |
| Mercredi    | Samedi (même semaine)       | CYCLE_2 | Mercredi (aujourd'hui)   |
| Jeudi       | Samedi (même semaine)       | CYCLE_2 | Mercredi (cette semaine) |
| Vendredi    | Samedi (même semaine)       | CYCLE_2 | Mercredi (cette semaine) |
| Samedi      | Mercredi (semaine suivante) | CYCLE_1 | Samedi (aujourd'hui)     |

## 🎨 Design et Responsive

L'application est entièrement responsive et utilise Mantine UI pour :

- Design moderne et épuré
- Mode clair/sombre
- Navigation adaptative (sidebar sur desktop, menu burger sur mobile)
- Composants accessibles

## 📁 Structure du Projet

```
depot_pain_app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── products/route.ts
│   │   └── orders/route.ts
│   ├── login/page.tsx
│   ├── order/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppLayout.tsx
│   └── OrderComponent.tsx
├── lib/
│   ├── auth.ts
│   ├── delivery-cycles.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env (à créer)
├── .env.example
└── package.json
```

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Authentification JWT avec expiration (7 jours)
- Validation des entrées côté serveur
- Protection des routes API
- Séparation des rôles (ADMIN/CLIENT)

## 🚧 Développements Futurs

- [ ] Notifications par email
- [ ] Export PDF des commandes
- [ ] Statistiques et graphiques pour l'admin
- [ ] Système de paiement en ligne
- [ ] Application mobile (React Native)
- [ ] Gestion des stocks en temps réel
- [ ] Programme de fidélité

## 📝 License

Ce projet est sous licence MIT.

## 👥 Support

Pour toute question ou problème, contactez l'administrateur système.

---

Développé avec ❤️ pour votre commune
