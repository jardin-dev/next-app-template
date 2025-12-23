# Script de configuration PostgreSQL pour Dépôt de Pain
# Exécutez ce script dans PowerShell

Write-Host "🐘 Configuration de PostgreSQL pour Dépôt de Pain" -ForegroundColor Cyan
Write-Host ""

# Chemin vers psql
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$psqlPath15 = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
$psqlPath17 = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

# Trouver psql
if (Test-Path $psqlPath) {
    $psql = $psqlPath
} elseif (Test-Path $psqlPath15) {
    $psql = $psqlPath15
} elseif (Test-Path $psqlPath17) {
    $psql = $psqlPath17
} else {
    Write-Host "❌ PostgreSQL n'a pas été trouvé dans les emplacements standards." -ForegroundColor Red
    Write-Host "Veuillez vérifier le chemin d'installation de PostgreSQL." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL trouvé : $psql" -ForegroundColor Green
Write-Host ""

# Demander le mot de passe
Write-Host "📝 Entrez le mot de passe de l'utilisateur 'postgres' :" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "🔨 Création de la base de données 'depot_pain'..." -ForegroundColor Cyan

# Créer la base de données
$env:PGPASSWORD = $plainPassword
$createDbCommand = "CREATE DATABASE depot_pain;"
$checkDbCommand = "SELECT 1 FROM pg_database WHERE datname='depot_pain';"

# Vérifier si la base existe déjà
$result = & $psql -U postgres -h localhost -p 5432 -t -c $checkDbCommand 2>&1

if ($result -match "1") {
    Write-Host "ℹ️  La base de données 'depot_pain' existe déjà." -ForegroundColor Yellow
} else {
    # Créer la base de données
    & $psql -U postgres -h localhost -p 5432 -c $createDbCommand 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données 'depot_pain' créée avec succès !" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la création de la base de données." -ForegroundColor Red
        Write-Host "Vérifiez que PostgreSQL est démarré et que le mot de passe est correct." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "📝 Configuration du fichier .env..." -ForegroundColor Cyan

# Créer ou mettre à jour le fichier .env
$envContent = @"
# Database
DATABASE_URL="postgresql://postgres:$plainPassword@localhost:5432/depot_pain?schema=public"

# JWT Secret (générez une clé sécurisée en production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-$(Get-Random)"

# Next Auth (optionnel)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-$(Get-Random)"
"@

$envPath = ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "✅ Fichier .env créé/mis à jour !" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. npx prisma generate" -ForegroundColor White
Write-Host "  2. npx prisma db push" -ForegroundColor White
Write-Host "  3. npm run db:seed" -ForegroundColor White
Write-Host ""
Write-Host "Voulez-vous exécuter ces commandes maintenant ? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "⚙️  Génération du client Prisma..." -ForegroundColor Cyan
    npx prisma generate
    
    Write-Host ""
    Write-Host "📊 Création des tables..." -ForegroundColor Cyan
    npx prisma db push
    
    Write-Host ""
    Write-Host "🌱 Peuplement de la base de données..." -ForegroundColor Cyan
    npm run db:seed
    
    Write-Host ""
    Write-Host "🎉 Tout est prêt !" -ForegroundColor Green
    Write-Host ""
    Write-Host "👤 Compte administrateur créé :" -ForegroundColor Cyan
    Write-Host "   Email: admin@depotpain.fr" -ForegroundColor White
    Write-Host "   Mot de passe: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "👤 Compte client de test créé :" -ForegroundColor Cyan
    Write-Host "   Email: client@example.fr" -ForegroundColor White
    Write-Host "   Mot de passe: client123" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✅ Configuration de la base de données terminée." -ForegroundColor Green
    Write-Host "Exécutez manuellement les commandes ci-dessus quand vous serez prêt." -ForegroundColor Yellow
}

# Nettoyer le mot de passe de l'environnement
$env:PGPASSWORD = $null
