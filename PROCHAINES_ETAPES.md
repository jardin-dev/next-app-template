# 🚧 Prochaines Étapes - Pages à Implémenter

Ce document liste les pages et fonctionnalités à développer pour compléter l'application.

## 📋 Pages Client à Créer

### 1. Page "Mes Commandes" (`app/my-orders/page.tsx`)

**Route :** `/my-orders`  
**Rôle :** CLIENT

**Fonctionnalités :**

- [ ] Liste de toutes les commandes de l'utilisateur
- [ ] Filtres par statut (En attente, Confirmée, Livrée, etc.)
- [ ] Filtres par date
- [ ] Affichage des détails de chaque commande
- [ ] Badge de statut coloré
- [ ] Montant total
- [ ] Date de livraison
- [ ] Possibilité d'annuler (si statut = PENDING)

**Composants suggérés :**

```tsx
- Table ou Cards pour afficher les commandes
- Badge pour le statut
- Modal pour les détails
- Button pour annuler
```

**API à utiliser :**

```typescript
GET / api / orders;
// Retourne les commandes de l'utilisateur connecté
```

### 2. Page "Mon Profil" (`app/profile/page.tsx`)

**Route :** `/profile`  
**Rôle :** CLIENT

**Fonctionnalités :**

- [ ] Affichage des informations personnelles
- [ ] Modification du prénom, nom
- [ ] Modification du téléphone, adresse
- [ ] Changement de mot de passe
- [ ] Statistiques personnelles (nombre de commandes, montant total)

**Composants suggérés :**

```tsx
- TextInput pour les champs
- PasswordInput pour le mot de passe
- Button pour sauvegarder
- Alert pour les confirmations
```

**API à créer :**

```typescript
GET / api / users / me;
PUT / api / users / me;
PUT / api / users / me / password;
```

## 📋 Pages Admin à Créer

### 3. Page "Tableau de Bord" (`app/admin/page.tsx`)

**Route :** `/admin`  
**Rôle :** ADMIN

**Fonctionnalités :**

- [ ] Statistiques générales
  - Nombre total de commandes
  - Montant total des ventes
  - Nombre de clients actifs
  - Produits les plus vendus
- [ ] Graphiques
  - Évolution des ventes
  - Répartition par catégorie
- [ ] Commandes récentes
- [ ] Alertes (produits en rupture, etc.)

**Composants suggérés :**

```tsx
- Grid pour la disposition
- Card pour chaque statistique
- Table pour les commandes récentes
- Charts (recharts ou chart.js)
```

**API à créer :**

```typescript
GET / api / admin / stats;
// Retourne les statistiques globales
```

### 4. Page "Gestion des Produits" (`app/admin/products/page.tsx`)

**Route :** `/admin/products`  
**Rôle :** ADMIN

**Fonctionnalités :**

- [ ] Liste de tous les produits
- [ ] Filtres par catégorie (Pain/Viennoiserie)
- [ ] Recherche par nom
- [ ] Ajout d'un nouveau produit
- [ ] Modification d'un produit
- [ ] Suppression d'un produit
- [ ] Toggle disponibilité
- [ ] Upload d'image

**Composants suggérés :**

```tsx
- DataTable avec actions
- Modal pour créer/éditer
- FileInput pour l'image
- Switch pour la disponibilité
- NumberInput pour le prix
```

**API à créer :**

```typescript
PUT /api/products/[id]
DELETE /api/products/[id]
POST /api/upload (pour les images)
```

### 5. Page "Gestion des Commandes" (`app/admin/orders/page.tsx`)

**Route :** `/admin/orders`  
**Rôle :** ADMIN

**Fonctionnalités :**

- [ ] Liste de toutes les commandes
- [ ] Filtres par :
  - Date de livraison
  - Statut
  - Client
- [ ] Vue groupée par date de livraison
- [ ] Export PDF/Excel pour le boulanger
- [ ] Modification du statut
- [ ] Détails de chaque commande
- [ ] Informations client (téléphone, adresse)

**Composants suggérés :**

```tsx
- Tabs pour les différentes vues
- DatePicker pour filtrer
- Select pour le statut
- Accordion pour grouper par date
- Button pour exporter
```

**API existante :**

```typescript
GET /api/orders?deliveryDate=2024-12-25
// Déjà implémentée avec filtre par date
```

**API à créer :**

```typescript
PUT /api/orders/[id]/status
GET /api/orders/export?deliveryDate=...
```

### 6. Page "Gestion des Utilisateurs" (`app/admin/users/page.tsx`)

**Route :** `/admin/users`  
**Rôle :** ADMIN

**Fonctionnalités :**

- [ ] Liste de tous les utilisateurs
- [ ] Filtres par rôle (Admin/Client)
- [ ] Recherche par nom/email
- [ ] Activation/Désactivation de compte
- [ ] Modification du rôle
- [ ] Voir l'historique des commandes d'un client
- [ ] Statistiques par client

**Composants suggérés :**

```tsx
- DataTable avec filtres
- Badge pour le rôle
- Switch pour isActive
- Modal pour les détails
```

**API à créer :**

```typescript
GET / api / admin / users;
PUT / api / admin / users / [id];
GET / api / admin / users / [id] / orders;
```

## 🔧 Fonctionnalités Transversales à Ajouter

### 7. Upload d'Images

**Fichier :** `app/api/upload/route.ts`

**Fonctionnalités :**

- [ ] Upload de fichiers
- [ ] Validation (type, taille)
- [ ] Stockage (local ou cloud)
- [ ] Retour de l'URL

**Technologies suggérées :**

- Cloudinary
- AWS S3
- Vercel Blob
- Stockage local (public/uploads)

### 8. Export PDF

**Fichier :** `lib/pdf-generator.ts`

**Fonctionnalités :**

- [ ] Génération de PDF pour les commandes
- [ ] Liste récapitulative par date de livraison
- [ ] Bon de commande client

**Technologies suggérées :**

- jsPDF
- react-pdf
- pdfmake

### 9. Notifications Email

**Fichier :** `lib/email.ts`

**Fonctionnalités :**

- [ ] Email de confirmation de commande
- [ ] Email de rappel avant livraison
- [ ] Email de changement de statut

**Technologies suggérées :**

- Nodemailer
- SendGrid
- Resend
- Mailgun

### 10. Middleware d'Authentification

**Fichier :** `middleware.ts`

**Fonctionnalités :**

- [ ] Protection automatique des routes
- [ ] Redirection si non authentifié
- [ ] Vérification du rôle

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/order')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Vérifier le rôle pour /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vérifier que l'utilisateur est ADMIN
  }
}
```

## 📊 Améliorations du Schéma de Base de Données

### 11. Table "Categories" (Optionnel)

Si vous souhaitez des catégories dynamiques :

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  products    Product[]
}
```

### 12. Table "Settings" (Optionnel)

Pour les paramètres de l'application :

```prisma
model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String
}

// Exemples :
// - delivery_fee
// - min_order_amount
// - order_deadline_hours
```

## 🎨 Composants Réutilisables à Créer

### 13. Composants UI

**Fichier :** `components/`

- [ ] `OrderCard.tsx` - Carte de commande
- [ ] `ProductCard.tsx` - Carte de produit
- [ ] `StatCard.tsx` - Carte de statistique
- [ ] `OrderStatusBadge.tsx` - Badge de statut
- [ ] `DeliveryDateBadge.tsx` - Badge de date de livraison
- [ ] `EmptyState.tsx` - État vide
- [ ] `LoadingState.tsx` - État de chargement
- [ ] `ErrorState.tsx` - État d'erreur

### 14. Hooks Personnalisés

**Fichier :** `hooks/`

- [ ] `useAuth.ts` - Hook d'authentification
- [ ] `useOrders.ts` - Hook pour les commandes
- [ ] `useProducts.ts` - Hook pour les produits
- [ ] `useDeliveryInfo.ts` - Hook pour les infos de livraison

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, logout };
}
```

## 🧪 Tests à Ajouter

### 15. Tests Unitaires

**Fichier :** `__tests__/`

- [ ] Tests des fonctions de calcul de cycles
- [ ] Tests des utilitaires d'authentification
- [ ] Tests des composants

```typescript
// __tests__/delivery-cycles.test.ts
describe('getNextDeliveryInfo', () => {
  it('should return CYCLE_1 on Monday', () => {
    const monday = new Date('2024-12-23'); // Lundi
    const info = getNextDeliveryInfo(monday);
    expect(info.cycle).toBe('CYCLE_1');
  });
});
```

### 16. Tests d'Intégration

- [ ] Tests des API routes
- [ ] Tests de bout en bout (E2E)

## 📱 Version Mobile (Optionnel)

### 17. Application React Native

**Fonctionnalités :**

- [ ] Même interface que la version web
- [ ] Notifications push
- [ ] Scan de QR code pour les commandes
- [ ] Mode hors ligne

## 🔐 Sécurité Supplémentaire

### 18. Améliorations de Sécurité

- [ ] Rate limiting sur les API
- [ ] CSRF protection
- [ ] Validation Zod sur toutes les entrées
- [ ] Logs d'audit
- [ ] 2FA (authentification à deux facteurs)

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';

export const ratelimit = new Ratelimit({
  redis: ...,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## 📈 Analytics et Monitoring

### 19. Suivi des Performances

- [ ] Google Analytics
- [ ] Sentry pour les erreurs
- [ ] Vercel Analytics
- [ ] Logs structurés

## 🌐 Internationalisation (i18n)

### 20. Support Multi-langues

Si vous souhaitez supporter plusieurs langues :

- [ ] next-intl ou react-i18next
- [ ] Fichiers de traduction
- [ ] Sélecteur de langue

## 📝 Checklist de Déploiement

### 21. Avant le Déploiement

- [ ] Configurer les variables d'environnement en production
- [ ] Générer un JWT_SECRET sécurisé
- [ ] Configurer la base de données PostgreSQL en production
- [ ] Exécuter les migrations Prisma
- [ ] Créer un compte administrateur
- [ ] Tester toutes les fonctionnalités
- [ ] Configurer HTTPS
- [ ] Configurer les backups de la base de données
- [ ] Configurer les logs
- [ ] Tester les performances

## 🎯 Priorités Suggérées

### Phase 1 (Essentiel)

1. ✅ Schéma de base de données
2. ✅ Authentification
3. ✅ Composant de commande
4. ✅ AppShell
5. Page "Mes Commandes"
6. Page "Gestion des Produits" (Admin)

### Phase 2 (Important)

7. Page "Gestion des Commandes" (Admin)
8. Page "Mon Profil"
9. Upload d'images
10. Export PDF

### Phase 3 (Améliorations)

11. Tableau de bord Admin
12. Notifications email
13. Statistiques avancées
14. Tests

### Phase 4 (Optionnel)

15. Application mobile
16. Programme de fidélité
17. Paiement en ligne
18. i18n

---

**Note :** Ce document est un guide. Adaptez-le selon vos besoins et priorités !

**Bon développement ! 🚀**
