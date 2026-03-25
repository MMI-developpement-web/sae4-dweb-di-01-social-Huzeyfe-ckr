# Guide de Configuration Locale - SAE4 DWeb-DI.01

## 🎯 Vue d'ensemble

Ce guide vous helps à configurer votre environnement de développement **local avec Docker et VS Code Dev Containers**. Vous pouvez ainsi continuer votre travail Codespace sans rien perdre.

## ✅ Prérequis

- [x] Docker Desktop installé (v29.3.0+)
- [x] Docker Compose installé (v5.1.0+)
- [ ] VS Code installé avec l'extension "Dev Containers"

## 📦 Étape 1 : Installer l'extension VS Code

1. Ouvrez VS Code
2. Allez dans **Extensions** (Ctrl+Shift+X / Cmd+Shift+X)
3. Cherchez **"Dev Containers"** (par Microsoft)
4. Cliquez sur **Installer**

## 🚀 Étape 2 : Ouvrir le projet dans Dev Container

### Option A : Backend (Symfony/PHP)

1. Ouvrez VS Code
2. Tapez `Cmd+Shift+P` (ou `Ctrl+Shift+P` sur Windows/Linux)
3. Cherchez **"Dev Containers: Reopen in Container"**
4. VS Code va reconstruire le conteneur avec toutes les extensions PHP

### Option B : Frontend (React/TypeScript)

1. Si vous avez ouvert le projet avec le backend, ouvrez un nouveau VS Code
2. Tapez `Cmd+Shift+P`
3. Cherchez **"Dev Containers: Open Workspace in Container"**
4. Sélectionnez le fichier `.devcontainer/devcontainer.frontend.json`
5. VS Code va configurer l'environnement frontend avec Node.js et les outils JavaScript

## 🔄 Étape 3 : Récupérer votre travail depuis Codespace

### ⚠️ IMPORTANT - Avant de commencer :

Si vous avez du code non-committé sur Codespace, vous devez d'abord le sauvegarder.

**Sur Codespace :**
```bash
# Vérifiez vos changements
git status

# Committez-les
git add .
git commit -m "Sauvegarde avant passage en local"

# Ou créez une branche temporaire
git checkout -b temp-backup
git push origin temp-backup
```

### Récupérer le code sur votre machine locale :

```bash
# Si vous avez créé une branche de backup
git branch -a  # Voir toutes les branches
git checkout temp-backup
git pull origin temp-backup

# Ou simplement mettre à jour la branche courante
git pull origin main
```

## 📂 Structure attendue

Votre dossier devrait avoir cette structure :

```
sae4-dweb-di-01-social-Huzeyfe-ckr/
├── .devcontainer/
│   ├── devcontainer.json           # Backend/PHP
│   └── devcontainer.frontend.json  # Frontend/React
├── backend/
│   ├── src/
│   ├── composer.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── docker/
├── docker-compose.yml
└── README.md
```

## 🎮 Commandes courantes dans le Dev Container

### Backend (Symfony)

```bash
# À l'intérieur du Dev Container, vous pouvez utiliser :
php bin/console              # CLI Symfony
composer install             # Installer les dépendances
composer update              # Mettre à jour les dépendances
php -S localhost:9000        # Lancer un serveur PHP simple (optionnel)
```

### Frontend (React/Vite)

```bash
# À l'intérieur du Dev Container frontend :
npm install                  # Installer les dépendances
npm run dev                  # Lancer le serveur Vite en développement
npm run build                # Compiler pour la production
npm run lint                 # Vérifier le code avec ESLint
```

## 🌐 Accéder à vos applications

Depuis VS Code, grâce aux **Port Forwards** configurés :

| Service | URL | Port |
|---------|-----|------|
| Frontend (React/Vite) | http://localhost:8090 | 8090 |
| Backend (Symfony) | http://localhost:8080 | 8080 |
| Vite Dev Server | http://localhost:5173 | 5173 |
| phpMyAdmin | http://localhost:8070 | 8070 |
| PHP-FPM | localhost:9000 | 9000 |

## 🗄️ Base de données

### Accéder phpMyAdmin

1. Visitez http://localhost:8070
2. **Utilisateur :** root
3. **Mot de passe :** root
4. **Base de données :** SAE4_DWeb_DI_01

### Importer un SQL depuis Codespace

1. Créez le dossier (s'il n'existe pas) :
   ```bash
   mkdir -p docker/mysql/sql_import_scripts/
   ```

2. Placez vos fichiers SQL dans ce dossier

3. Relancez les conteneurs :
   ```bash
   docker-compose restart sae-mysql
   ```

## 🔗 Synchroniser le code entre Codespace et Local

### Garder les deux en sync avec Git

**Sur Codespace :**
```bash
# Committez régulièrement
git add .
git commit -m "Travail sur [fonctionnalité]"
git push origin main  # Ou votre branche
```

**Sur Local :**
```bash
# Récupérez les changements
git pull origin main
# Relancez les conteneurs si nécessaire
docker-compose down
docker-compose up -d
```

## ⚙️ Troubleshooting

### Le Dev Container ne démarre pas

```bash
# Reconstruisez les images
docker-compose build --no-cache

# Puis relancez
docker-compose up -d
```

### Les dépendances ne sont pas installées

**Pour PHP :**
```bash
docker-compose run --rm sae-backend composer install
```

**Pour Node.js :**
```bash
docker-compose run --rm sae-frontend npm install
```

### Problème de permission sur les fichiers

```bash
# Assurez-vous que les dossiers ont les bonnes permissions
chmod -R 755 backend/
chmod -R 755 frontend/
```

### Les ports sont déjà utilisés

```bash
# Vérifiez quels processus utilisent les ports
lsof -i :8080   # Port du backend
lsof -i :8090   # Port du frontend
lsof -i :5173   # Port de Vite

# Fermez le processus ou changez le port dans docker-compose.yml
```

## 📝 Notes importantes

1. **Ne perdez pas votre code:** Committez régulièrement sur Git
2. **Utilisez les Dev Containers:** C'est l'équivalent local de Codespace
3. **Docker doit tourner:** Assurez-vous que Docker Desktop est ouvert
4. **Les dossiers node_modules et vendor:** Sont créés dans les conteneurs, pas sur votre machine
5. **CycleB branche:** N'oubliez pas de vous y connecter avec `git checkout CycleB`

## 🎉 Vous êtes prêt !

Vous pouvez maintenant :
- ✅ Développer localement comme sur Codespace
- ✅ Garder votre code synchronisé via Git
- ✅ Utiliser tous les outils qui fonctionnaient sur Codespace
- ✅ Avoir une meilleure performance sur votre machine local

Bonne chance pour votre SAE4 ! 🚀
