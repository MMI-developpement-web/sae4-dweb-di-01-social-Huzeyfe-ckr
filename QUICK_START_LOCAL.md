# 🚀 Guide Rapide : De Codespace à Local

## En 5 minutes ⏱️

### 1️⃣ Installer l'extension VS Code
Ouvrez VS Code → Extensions → Cherchez **"Dev Containers"** → Installer (par Microsoft)

### 2️⃣ Lancer l'initialisation
```bash
cd /Users/macbookairm4dehuzeyfe/SAE401/sae4-dweb-di-01-social-Huzeyfe-ckr
./init-local.sh
```

### 3️⃣ Ouvrir le backend dans VS Code
- Tapez `Cmd+Shift+P`
- Cherchez **"Dev Containers: Open Folder in Container"**
- VS Code redémarrera automatiquement

### 4️⃣ Accéder à votre branche CycleB
```bash
git checkout CycleB
git pull origin CycleB
```

### 5️⃣ C'est bon ! 🎉
```
Frontend:   http://localhost:8090
Backend:    http://localhost:8080
Vite:       http://localhost:5173
phpMyAdmin: http://localhost:8070
```

---

## ⚠️ Si vous êtes bloqué

### Mon Codespace a des changements non-committés
```bash
# Sur Codespace D'ABORD:
git add .
git commit -m "Sauvegarde avant local"
git push origin main

# Puis sur Local:
git pull origin main
```

### Les conteneurs ne démarrent pas
```bash
# Vérifier Docker
docker --version

# Redémarrer Docker Desktop via l'app Mac

# Relancer les conteneurs
docker-compose restart
```

### Je ne vois pas la branche `CycleB`
```bash
# Voir toutes les branches distantes
git branch -a

# Si vous la voyez, créez-la localement
git checkout CycleB

# Si vous ne la voyez pas, créez-la depuis main
git checkout main
git checkout -b CycleB
```

### npm/composer dit que les dépendances ne sont pas installées
```bash
# Réinstallez depuis le conteneur
docker-compose run --rm sae-frontend npm install
docker-compose run --rm sae-backend composer install
```

---

## 🔄 Flux de travail quotidien

```bash
# Le matin
docker-compose start

# Pendant qu'on code dans VS Code Dev Container
# (Pas besoin de terminal spécial, tout fonctionne dans VS Code)

# Si vous changez de branche
git checkout CycleB
git pull origin CycleB

# Avant de partir
git add .
git commit -m "Votre message"
git push origin CycleB

# Et arrêter les conteneurs
docker-compose stop
```

---

## 📱 Syncing avec un autre endroit

Si vous devez travailler à la fois sur Codespace et Local :

1. **Committez régulièrement** sur votre branche
2. **Avant de changer d'environnement**, faites un `git push`
3. Dans le nouvel environnement, faites `git pull`
4. C'est tout ! Git gère la synchronisation

---

## 💡 Pro Tips

✅ **Commitez souvent** - Cela rend la synchronisation facile  
✅ **Utilisez Des Branches** - `main` pour le stable, `CycleB` pour votre travail  
✅ **Relisez avant de committer** - `git diff` et `git status`  
✅ **Les Dev Containers sont du cache** - Supprimez-les et reconstruisez si problème  

---

**Besoin d'aide?** Relisez `SETUP_LOCAL.md` pour plus de détails.
