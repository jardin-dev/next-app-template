# 🐘 Guide d'Installation PostgreSQL sur Windows

## 📥 Méthode 1 : Installation Officielle (Recommandée)

### Étape 1 : Télécharger PostgreSQL

1. Allez sur : https://www.postgresql.org/download/windows/
2. Cliquez sur "Download the installer"
3. Téléchargez la version **PostgreSQL 16** (ou la dernière version)
4. Choisissez **Windows x86-64**

**Lien direct :** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Étape 2 : Installer PostgreSQL

1. **Lancez l'installateur** téléchargé
2. Cliquez sur **"Next"**
3. **Répertoire d'installation** : Laissez par défaut (`C:\Program Files\PostgreSQL\16`)
4. **Composants à installer** : Cochez tout (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
5. **Répertoire de données** : Laissez par défaut
6. **Mot de passe** :
   - ⚠️ **IMPORTANT** : Notez bien ce mot de passe !
   - Exemple : `postgres123` (pour le développement local)
   - C'est le mot de passe de l'utilisateur `postgres` (super admin)
7. **Port** : Laissez `5432` (port par défaut)
8. **Locale** : Laissez par défaut ou choisissez "French, France"
9. Cliquez sur **"Next"** puis **"Install"**
10. Attendez la fin de l'installation (2-3 minutes)
11. **Décochez "Stack Builder"** à la fin et cliquez sur **"Finish"**

### Étape 3 : Vérifier l'Installation

1. Ouvrez **PowerShell** ou **CMD**
2. Tapez :
   ```bash
   psql --version
   ```
3. Vous devriez voir : `psql (PostgreSQL) 16.x`

**Si la commande ne fonctionne pas :**

- Ajoutez PostgreSQL au PATH :
  - Allez dans : `Paramètres > Système > Paramètres système avancés > Variables d'environnement`
  - Dans "Variables système", trouvez `Path`
  - Ajoutez : `C:\Program Files\PostgreSQL\16\bin`
  - Redémarrez PowerShell

### Étape 4 : Créer la Base de Données

1. Ouvrez **PowerShell** en tant qu'administrateur
2. Connectez-vous à PostgreSQL :
   ```bash
   psql -U postgres
   ```
3. Entrez le mot de passe que vous avez défini lors de l'installation
4. Créez la base de données :
   ```sql
   CREATE DATABASE depot_pain;
   ```
5. Vérifiez :
   ```sql
   \l
   ```
   Vous devriez voir `depot_pain` dans la liste
6. Quittez :
   ```sql
   \q
   ```

### Étape 5 : Configurer le Fichier .env

Ouvrez le fichier `.env` dans votre projet et modifiez :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/depot_pain?schema=public"
```

**Remplacez `VOTRE_MOT_DE_PASSE`** par le mot de passe que vous avez défini à l'étape 2.

Exemple :

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/depot_pain?schema=public"
```

### Étape 6 : Initialiser la Base de Données

Dans votre terminal (dans le dossier du projet) :

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Créer les tables
npx prisma db push

# 3. Peupler avec les données de test
npm run db:seed
```

### Étape 7 : Vérifier

Vous devriez voir :

```
🌱 Début du seeding de la base de données...
✅ Administrateur créé: admin@depotpain.fr
✅ Client de test créé: client@example.fr
✅ Pain créé: Baguette Tradition
...
🎉 Seeding terminé avec succès !

📝 Informations de connexion :
   Admin - Email: admin@depotpain.fr | Mot de passe: admin123
   Client - Email: client@example.fr | Mot de passe: client123
```

---

## 📥 Méthode 2 : Installation via Chocolatey (Alternative)

Si vous avez Chocolatey installé :

```bash
choco install postgresql
```

Puis suivez les étapes 4 à 7 ci-dessus.

---

## 🛠️ Outils Utiles

### pgAdmin 4 (Interface Graphique)

pgAdmin 4 est installé automatiquement avec PostgreSQL.

1. Cherchez "pgAdmin 4" dans le menu Démarrer
2. Lancez-le
3. Connectez-vous avec :
   - Host : `localhost`
   - Port : `5432`
   - Username : `postgres`
   - Password : Votre mot de passe

Vous pourrez voir et gérer vos bases de données visuellement.

### Prisma Studio (Interface pour votre Projet)

Une fois la base de données configurée :

```bash
npx prisma studio
```

Cela ouvre une interface web pour gérer vos données.

---

## 🆘 Problèmes Courants

### Erreur : "psql: error: connection to server failed"

**Solution :**

1. Vérifiez que PostgreSQL est démarré :
   - Ouvrez "Services" (services.msc)
   - Cherchez "postgresql-x64-16"
   - Cliquez droit > Démarrer

### Erreur : "password authentication failed"

**Solution :**

- Vérifiez que vous utilisez le bon mot de passe dans `.env`
- Le mot de passe doit correspondre à celui défini lors de l'installation

### Erreur : "database does not exist"

**Solution :**

```bash
psql -U postgres
CREATE DATABASE depot_pain;
\q
```

### Port 5432 déjà utilisé

**Solution :**

- Changez le port dans PostgreSQL
- Ou arrêtez l'autre service qui utilise le port 5432

---

## ✅ Checklist Finale

- [ ] PostgreSQL installé
- [ ] Service PostgreSQL démarré
- [ ] Base de données `depot_pain` créée
- [ ] Fichier `.env` configuré avec le bon mot de passe
- [ ] `npx prisma generate` exécuté
- [ ] `npx prisma db push` exécuté avec succès
- [ ] `npm run db:seed` exécuté avec succès
- [ ] Utilisateur admin créé (admin@depotpain.fr / admin123)

---

## 🎉 Prêt !

Une fois toutes ces étapes terminées, vous pourrez :

- Vous connecter avec l'admin : `admin@depotpain.fr` / `admin123`
- Utiliser l'application normalement
- Gérer vos données avec pgAdmin 4 ou Prisma Studio

**Bon développement ! 🚀**
