# 📊 Documentation Technique - Dépôt de Pain

## 1. Schéma de Base de Données PostgreSQL

### Diagramme ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USERS (Utilisateurs)                         │
├─────────────────────────────────────────────────────────────────────────┤
│ • id (PK)              : String (CUID)                                  │
│ • email                : String (UNIQUE)                                │
│ • password             : String (Hash bcrypt)                           │
│ • firstName            : String                                         │
│ • lastName             : String                                         │
│ • phone                : String (nullable)                              │
│ • address              : String (nullable)                              │
│ • role                 : UserRole (ADMIN | CLIENT)                      │
│ • isActive             : Boolean (default: true)                        │
│ • createdAt            : DateTime                                       │
│ • updatedAt            : DateTime                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            ORDERS (Commandes)                           │
├─────────────────────────────────────────────────────────────────────────┤
│ • id (PK)              : String (CUID)                                  │
│ • orderNumber          : String (UNIQUE)                                │
│ • userId (FK)          : String → USERS.id                              │
│ • status               : OrderStatus (PENDING, CONFIRMED, etc.)         │
│ • deliveryCycle        : DeliveryCycle (CYCLE_1 | CYCLE_2)              │
│ • orderDate            : DateTime                                       │
│ • deliveryDate         : DateTime                                       │
│ • totalAmount          : Float                                          │
│ • notes                : String (nullable)                              │
│ • createdAt            : DateTime                                       │
│ • updatedAt            : DateTime                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ORDER_ITEMS (Détails Commande)                   │
├─────────────────────────────────────────────────────────────────────────┤
│ • id (PK)              : String (CUID)                                  │
│ • orderId (FK)         : String → ORDERS.id                             │
│ • productId (FK)       : String → PRODUCTS.id                           │
│ • quantity             : Int                                            │
│ • unitPrice            : Float                                          │
│ • subtotal             : Float (quantity × unitPrice)                   │
│ • createdAt            : DateTime                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTS (Produits)                           │
├─────────────────────────────────────────────────────────────────────────┤
│ • id (PK)              : String (CUID)                                  │
│ • name                 : String                                         │
│ • description          : String (nullable)                              │
│ • category             : ProductCategory (PAIN | VIENNOISERIE)          │
│ • price                : Float                                          │
│ • imageUrl             : String (nullable)                              │
│ • isAvailable          : Boolean (default: true)                        │
│ • stock                : Int (nullable)                                 │
│ • createdAt            : DateTime                                       │
│ • updatedAt            : DateTime                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Énumérations

```typescript
enum UserRole {
  ADMIN     // Administrateur
  CLIENT    // Client
}

enum ProductCategory {
  PAIN          // Pain
  VIENNOISERIE  // Viennoiserie
}

enum OrderStatus {
  PENDING      // En attente
  CONFIRMED    // Confirmée
  PREPARING    // En préparation
  DELIVERED    // Livrée
  CANCELLED    // Annulée
}

enum DeliveryCycle {
  CYCLE_1  // Samedi → Mercredi
  CYCLE_2  // Mercredi → Samedi
}
```

### Index et Contraintes

**USERS**

- Index unique sur `email`
- Contrainte : `email` doit être valide

**ORDERS**

- Index unique sur `orderNumber`
- Index sur `userId` (pour les requêtes par utilisateur)
- Index sur `deliveryDate` (pour les requêtes par date)
- Index sur `status` (pour filtrer par statut)
- Contrainte FK : `userId` → `USERS.id` (CASCADE on delete)

**ORDER_ITEMS**

- Index sur `orderId` (pour les requêtes par commande)
- Index sur `productId` (pour les requêtes par produit)
- Contrainte FK : `orderId` → `ORDERS.id` (CASCADE on delete)
- Contrainte FK : `productId` → `PRODUCTS.id` (RESTRICT on delete)

**PRODUCTS**

- Pas d'index supplémentaire nécessaire

## 2. Logique des Cycles de Livraison

### Algorithme de Calcul

```typescript
function getNextDeliveryInfo(currentDate: Date): DeliveryInfo {
  const dayOfWeek = currentDate.getDay(); // 0=Dimanche, 6=Samedi

  // Logique de détermination du cycle
  if (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2) {
    // Dimanche à Mardi → Livraison Mercredi (même semaine)
    cycle = CYCLE_1;
    deliveryDate = mercredi_cette_semaine;
    orderDeadline = samedi_precedent;
  }
  else if (dayOfWeek === 3) {
    // Mercredi → Livraison Samedi (même semaine)
    cycle = CYCLE_2;
    deliveryDate = samedi_cette_semaine;
    orderDeadline = mercredi_aujourdhui;
  }
  else if (dayOfWeek === 4 || dayOfWeek === 5) {
    // Jeudi à Vendredi → Livraison Samedi (même semaine)
    cycle = CYCLE_2;
    deliveryDate = samedi_cette_semaine;
    orderDeadline = mercredi_cette_semaine;
  }
  else { // dayOfWeek === 6
    // Samedi → Livraison Mercredi (semaine suivante)
    cycle = CYCLE_1;
    deliveryDate = mercredi_semaine_prochaine;
    orderDeadline = samedi_aujourdhui;
  }

  // Vérifier si la deadline est dépassée
  if (currentDate > orderDeadline) {
    // Passer au cycle suivant
    ...
  }

  return { cycle, deliveryDate, orderDeadline, ... };
}
```

### Tableau de Référence

| Jour Actuel | Cycle   | Livraison      | Deadline     | Commande Ouverte   |
| ----------- | ------- | -------------- | ------------ | ------------------ |
| Dimanche    | CYCLE_1 | Mercredi (S)   | Samedi (S-1) | ✅                 |
| Lundi       | CYCLE_1 | Mercredi (S)   | Samedi (S-1) | ✅                 |
| Mardi       | CYCLE_1 | Mercredi (S)   | Samedi (S-1) | ✅                 |
| Mercredi    | CYCLE_2 | Samedi (S)     | Mercredi (S) | ✅ (jusqu'à 23h59) |
| Jeudi       | CYCLE_2 | Samedi (S)     | Mercredi (S) | ✅                 |
| Vendredi    | CYCLE_2 | Samedi (S)     | Mercredi (S) | ✅                 |
| Samedi      | CYCLE_1 | Mercredi (S+1) | Samedi (S)   | ✅ (jusqu'à 23h59) |

_S = Semaine actuelle, S-1 = Semaine précédente, S+1 = Semaine suivante_

## 3. Architecture de l'Application

### Structure des Dossiers

```
depot_pain_app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts    # POST /api/auth/login
│   │   │   └── register/route.ts # POST /api/auth/register
│   │   ├── products/route.ts     # GET, POST /api/products
│   │   └── orders/route.ts       # GET, POST /api/orders
│   ├── login/page.tsx            # Page de connexion
│   ├── order/page.tsx            # Page de commande (client)
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                  # Page d'accueil (redirect)
├── components/
│   ├── AppLayout.tsx             # Layout avec navigation
│   └── OrderComponent.tsx        # Composant de commande
├── lib/
│   ├── auth.ts                   # Utilitaires d'authentification
│   ├── delivery-cycles.ts        # Logique des cycles
│   └── prisma.ts                 # Client Prisma
├── prisma/
│   ├── schema.prisma             # Schéma de base de données
│   └── seed.ts                   # Script de seed
└── package.json
```

### Flux d'Authentification

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       ▼
┌─────────────────────────────┐
│  API Route: login/route.ts  │
│                             │
│  1. Vérifier email          │
│  2. Vérifier password       │
│  3. Générer JWT token       │
│  4. Retourner user + token  │
└──────────┬──────────────────┘
           │
           │ 2. Response
           │    { token, user }
           ▼
┌─────────────────────────────┐
│  Client                     │
│                             │
│  1. Stocker token           │
│     localStorage.setItem()  │
│  2. Rediriger selon rôle    │
│     - ADMIN → /admin        │
│     - CLIENT → /order       │
└─────────────────────────────┘
```

### Flux de Commande

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Charger produits
       │    GET /api/products
       ▼
┌─────────────────────────────┐
│  OrderComponent             │
│                             │
│  1. Afficher catalogue      │
│  2. Gérer panier            │
│  3. Calculer cycle          │
│  4. Afficher deadline       │
└──────────┬──────────────────┘
           │
           │ 2. Valider commande
           │    POST /api/orders
           │    { deliveryCycle, items }
           ▼
┌─────────────────────────────┐
│  API Route: orders/route.ts │
│                             │
│  1. Vérifier auth (JWT)     │
│  2. Valider produits        │
│  3. Calculer total          │
│  4. Créer commande + items  │
│  5. Retourner commande      │
└──────────┬──────────────────┘
           │
           │ 3. Confirmation
           ▼
┌─────────────┐
│   Client    │
│             │
│  Afficher   │
│  succès     │
└─────────────┘
```

## 4. API Endpoints

### Authentification

**POST /api/auth/login**

- Body: `{ email: string, password: string }`
- Response: `{ token: string, user: User }`
- Erreurs: 400, 401, 403, 500

**POST /api/auth/register**

- Body: `{ email, password, firstName, lastName, phone?, address? }`
- Response: `User` (sans password)
- Erreurs: 400, 409, 500

### Produits

**GET /api/products**

- Headers: Aucun (public)
- Response: `Product[]`
- Erreurs: 500

**POST /api/products** (Admin uniquement)

- Headers: `Authorization: Bearer <token>`
- Body: `{ name, description?, category, price, imageUrl?, stock? }`
- Response: `Product`
- Erreurs: 400, 401, 403, 500

### Commandes

**GET /api/orders**

- Headers: `Authorization: Bearer <token>`
- Query params: `deliveryDate?` (pour admin)
- Response: `Order[]` (avec user et orderItems)
- Erreurs: 401, 500

**POST /api/orders**

- Headers: `Authorization: Bearer <token>`
- Body: `{ deliveryCycle, deliveryDate, items: [{ productId, quantity }], notes? }`
- Response: `Order` (avec orderItems)
- Erreurs: 400, 401, 500

## 5. Sécurité

### Authentification JWT

```typescript
// Génération du token
const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

// Vérification du token
const payload = jwt.verify(token, JWT_SECRET);
```

### Hash des Mots de Passe

```typescript
// Lors de l'inscription
const hashedPassword = await bcrypt.hash(password, 10);

// Lors de la connexion
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Protection des Routes

```typescript
// Middleware d'authentification
const token = extractTokenFromHeader(authHeader);
const payload = verifyToken(token);

if (!payload) {
  return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
}

// Vérification du rôle
if (payload.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
}
```

## 6. Déploiement

### Variables d'Environnement Requises

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
NEXTAUTH_URL="https://..."
NEXTAUTH_SECRET="..."
```

### Commandes de Déploiement

```bash
# 1. Build de production
npm run build

# 2. Migration de la base de données
npx prisma migrate deploy

# 3. Seed de la base de données (optionnel)
npm run db:seed

# 4. Démarrage
npm start
```

### Checklist de Déploiement

- [ ] Configurer PostgreSQL en production
- [ ] Définir DATABASE_URL
- [ ] Générer JWT_SECRET sécurisé
- [ ] Exécuter les migrations Prisma
- [ ] Créer un compte administrateur
- [ ] Configurer HTTPS
- [ ] Activer les logs de production
- [ ] Configurer les backups de la base de données

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2024-12-22
