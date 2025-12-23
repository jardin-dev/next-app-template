# 🚀 Guide de Démarrage Rapide - Dépôt de Pain

Ce guide vous permettra de lancer l'application en quelques minutes.

## ⚡ Installation Rapide

### 1. Prérequis

Assurez-vous d'avoir installé :

- **Node.js** 18 ou supérieur
- **PostgreSQL** 14 ou supérieur
- **npm** ou **yarn**

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration de la base de données

#### a. Créer la base de données PostgreSQL

```sql
CREATE DATABASE depot_pain;
```

#### b. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://votre_utilisateur:votre_mot_de_passe@localhost:5432/depot_pain?schema=public"
JWT_SECRET="changez-cette-cle-secrete-en-production-utilisez-une-cle-longue-et-aleatoire"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-autre-cle-secrete-pour-nextauth"
```

**⚠️ Important :** Remplacez `votre_utilisateur` et `votre_mot_de_passe` par vos identifiants PostgreSQL.

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Peupler avec des données de test
npm run db:seed
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 👤 Connexion

Après le seed, vous pouvez vous connecter avec :

### Compte Administrateur

- **Email :** `admin@depotpain.fr`
- **Mot de passe :** `admin123`

### Compte Client (test)

- **Email :** `client@example.fr`
- **Mot de passe :** `client123`

## 📝 Premiers Pas

### En tant que Client

1. Connectez-vous avec le compte client
2. Consultez le catalogue de produits
3. Ajoutez des articles au panier
4. Vérifiez la date de livraison affichée
5. Validez votre commande

### En tant qu'Administrateur

1. Connectez-vous avec le compte admin
2. Accédez à la gestion des produits
3. Consultez les commandes par date de livraison
4. Gérez les utilisateurs

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev                    # Lancer en mode développement

# Base de données
npx prisma studio             # Interface graphique pour la DB
npx prisma db push            # Synchroniser le schéma
npm run db:seed               # Peupler la DB

# Production
npm run build                 # Build de production
npm start                     # Lancer en production

# Maintenance
npx prisma migrate dev        # Créer une migration
npx prisma migrate deploy     # Appliquer les migrations
```

## 🔧 Résolution de Problèmes

### Erreur de connexion à PostgreSQL

```
Error: P1001: Can't reach database server
```

**Solution :**

- Vérifiez que PostgreSQL est démarré
- Vérifiez vos identifiants dans `.env`
- Testez la connexion : `psql -U votre_utilisateur -d depot_pain`

### Erreur "Prisma Client not generated"

```bash
npx prisma generate
```

### Port 3000 déjà utilisé

```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

### Erreur JWT

Vérifiez que `JWT_SECRET` est défini dans `.env`

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **README.md** - Vue d'ensemble et fonctionnalités
- **DOCUMENTATION_TECHNIQUE.md** - Architecture et API

## 🎯 Prochaines Étapes

1. **Personnaliser les produits** : Ajoutez vos propres pains et viennoiseries
2. **Configurer les images** : Ajoutez des images pour les produits
3. **Tester les cycles** : Vérifiez le calcul des dates de livraison
4. **Créer des utilisateurs** : Ajoutez vos clients

## 💡 Conseils

- Utilisez **Prisma Studio** (`npx prisma studio`) pour gérer facilement les données
- Le mode développement recharge automatiquement les changements
- Consultez les logs de la console pour le débogage
- Les mots de passe sont automatiquement hashés avec bcrypt

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs de la console
2. Consultez la documentation technique
3. Vérifiez que toutes les dépendances sont installées
4. Assurez-vous que PostgreSQL est accessible

---

**Bon développement ! 🥖**
