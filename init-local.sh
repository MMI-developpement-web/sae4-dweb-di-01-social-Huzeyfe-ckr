#!/bin/bash

# Script d'initialisation du projet SAE4 en local
# Usage: ./init-local.sh

set -e  # Arrêter si une commande échoue

echo "🚀 Initialisation du projet SAE4 DWeb-DI.01 en local..."
echo ""

# Vérifier que Docker est running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
    exit 1
fi

echo "✅ Docker détecté"
echo ""

# Demander si on veut récupérer le code depuis Codespace
echo "📦 Voulez-vous mettre à jour depuis le repo distant ? (y/n)"
read -r update_repo
if [ "$update_repo" = "y" ] || [ "$update_repo" = "Y" ]; then
    echo "📥 Récupération des mises à jour..."
    git fetch origin
    git pull origin
fi

echo ""
echo "🐳 Construction et démarrage des conteneurs Docker..."
docker-compose build
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage des services..."
sleep 5

# Installation des dépendances backend
echo ""
echo "📦 Installation des dépendances PHP/Composer..."
docker-compose run --rm sae-backend composer install

# Installation des dépendances frontend
echo ""
echo "📦 Installation des dépendances Node.js/npm..."
docker-compose run --rm sae-frontend npm install

# Migrations de base de données
echo ""
echo "🗄️  Exécution des migrations Doctrine..."
docker-compose run --rm sae-backend php bin/console doctrine:migrations:migrate --no-interaction

echo ""
echo "✅ Initialisation terminée !"
echo ""
echo "🌐 Vos services sont maintenant disponibles à :"
echo "   - Frontend:  http://localhost:8090"
echo "   - Backend:   http://localhost:8080"
echo "   - Vite Dev:  http://localhost:5173"
echo "   - phpMyAdmin: http://localhost:8070"
echo ""
echo "💡 Conseils :"
echo "   1. Ouvrez le dossier 'backend' avec VS Code Dev Containers"
echo "   2. Lisez SETUP_LOCAL.md pour plus de détails"
echo "   3. Utilisez 'git checkout CycleB' pour accéder à votre branche"
echo ""
echo "✨ Bon développement !"
