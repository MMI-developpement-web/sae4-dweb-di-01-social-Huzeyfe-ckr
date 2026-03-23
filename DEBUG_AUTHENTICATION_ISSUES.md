# Guide Complet : Problèmes d'Authentification et Solutions

## 📋 Résumé Exécutif

Le système d'authentification a plusieurs problèmes qui empêchent le login de fonctionner. Ce document décrit chaque problème, sa cause, et la solution étape par étape.

**Problèmes identifiés:**
1. ❌ Mauvaise URL d'API (endpoint non trouvé → 404/401)
2. ❌ Mots de passe plaintext vs hashés (incompatibilité bcrypt)
3. ❌ Variable d'environnement VITE_API_URL incorrecte
4. ❌ Endpoint d'authentification ne retournant pas de token JWT

---

## 🔍 PROBLÈME 1: Mauvaise URL d'API

### Symptôme
- Requête login reçoit : `404 Not Found` ou `401 Unauthorized`
- Network tab affiche : `http://localhost:8080/auth/login` au lieu de `http://localhost:8080/api/auth/login`

### Cause
Le fichier `.env` du frontend définit :
```
VITE_API_URL=http://localhost:8080
```

Mais le code `api.ts` concatène `/auth/login`, ce qui donne :
- ❌ `http://localhost:8080/auth/login` (manque `/api`)
- ✅ Devrait être: `http://localhost:8080/api/auth/login`

### Solution
1. Ouvre le fichier `frontend/.env` (en local ET en SSH)
2. Change :
   ```
   VITE_API_URL=http://localhost:8080
   ```
   En :
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

3. Redémarre le serveur frontend (Ctrl+C, puis `npm run dev`)

### Vérification
- Ouvre DevTools (F12) → Network tab
- Fais un login
- Regarde la requête POST
- Elle devrait aller à : `http://localhost:8080/api/auth/login` ✅

---

## 🔐 PROBLÈME 2: Mots de Passe Plaintext vs Hashés

### Symptôme
- Le login réussit (200 OK) MAIS reject ensuite `401 Unauthorized`
- Message d'erreur : "Identifiant ou mot de passe incorrect"
- Même avec le bon mot de passe en base de données

### Cause
**Il y a deux formats de passwords en base de données:**

1. **Anciens comptes (plaintext):**
   ```
   user='azerty'  → password='azerty'
   user='jeanpg'  → password='jeanpg'
   ```
   
2. **Nouveaux comptes (bcrypt hashé):**
   ```
   user='testuser'  → password='$2y$13$tXvuUFdo7iJPhgertUSsl...'
   user='huzeyfe3'  → password='$2y$13$kqF4vQgv/kVjOgdouhuBzO...'
   ```

**Le code `JsonLoginAuthenticator.php` utilise :**
```php
if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
    throw new CustomUserMessageAuthenticationException('Invalid credentials.');
}
```

Cela appelle `password_verify()` qui fonctionne uniquement avec les hashes bcrypt, PAS avec les plaintext passwords.

### Solution A: Créer des nouveaux comptes (TEST RAPIDE)

Depuis phpMyAdmin, crée un nouveau compte hashé avec ce SQL :

```sql
INSERT INTO `user` (user, email, password, name, role, active, created_at) 
VALUES ('testuser', 'test@example.com', '$2y$13$tXvuUFdo7iJPhgertUSsl.KFcdBMXo8MOqMZUaFSjMKbGYcAbrGr6', 'Test User', 'user', 1, NOW());
```

**Login ensuite avec:**
- Username: `testuser`
- Password: `TestAccount123!` (exact, avec le `!`)

### Solution B: Rehashing des Anciens Comptes (PRODUCTION)

Crée une migration Doctrine pour convertir tous les plaintext en bcrypt :

1. Crée `backend/migrations/Version20260320000001.php` :
   ```php
   <?php
   declare(strict_types=1);
   namespace DoctrineMigrations;

   use Doctrine\DBAL\Schema\Schema;
   use Doctrine\Migrations\AbstractMigration;

   final class Version20260320000001 extends AbstractMigration
   {
       public function getDescription(): string
       {
           return 'Hash all plaintext passwords to bcrypt';
       }

       public function up(Schema $schema): void
       {
           // Get all passwords that are NOT already hashed (don't start with $2y$, $2a$, $2b$)
           $result = $this->connection->executeQuery(
               "SELECT id, password FROM `user` 
                WHERE password NOT LIKE '\$2y\$%' 
                  AND password NOT LIKE '\$2a\$%' 
                  AND password NOT LIKE '\$2b\$%'"
           );

           $users = $result->fetchAllAssociative();

           foreach ($users as $user) {
               $plainPassword = $user['password'];
               $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => 13]);
               
               $this->connection->update(
                   '`user`',
                   ['password' => $hashedPassword],
                   ['id' => $user['id']]
               );
           }
       }

       public function down(Schema $schema): void
       {
           throw new \Exception('This migration cannot be reversed');
       }
   }
   ```

2. Exécute :
   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction
   ```

3. Teste un ancien compte - il devrait fonctionner maintenant

### Vérification
Pour tester manuellement si un mot de passe fonctionne :

```bash
# En Docker local (dev)
docker compose exec sae-backend php bin/console app:debug:password

# Ou via SSH sur le serveur:
cd /chemin/vers/backend
php bin/console app:debug:password
```

Cela teste le compte `testuser` avec les passwords possibles et affiche ✅ ou ❌.

---

## 🚀 PROBLÈME 3: Variable d'Environnement Frontend

### Symptôme
Le frontend envoie les requêtes au mauvais endpoint

### Cause
Fichiers de configuration frontend :
- `frontend/.env` — utilisé localement
- `frontend/.env.production` — utilisé en production (MMI)
- `frontend/.env.local` — parfois surcharge les autres

### Solution - LOCAL (Docker/Codespace)

**Fichier: `frontend/.env`**
```
VITE_API_URL=http://localhost:8080/api
```

### Solution - PRODUCTION (Serveur MMI)

**Fichier: `frontend/.env.production`**
```
VITE_API_URL=https://mmi.unilim.fr/~cakir4/sae4-dweb-di-01-social-Huzeyfe-ckr/backend/api
```

ou si tu préfères avec des variables de build plus robustes :

**Fichier: `frontend/vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/~cakir4/sae4-dweb-di-01-social-Huzeyfe-ckr/frontend/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

### Vérification
- Build : `npm run build`
- Vérifie dans `dist/index.html` que les URLs sont correctes
- Teste le login après déploiement

---

## 📨 PROBLÈME 4: Pas de Token JWT Retourné

### Symptôme
- Login retourne `200 OK` mais pas de token
- Requête GET `/api/posts` échoue avec `401 Unauthorized`

### Cause
Le `LoginSuccessHandler` ne génère pas le token JWT correctement.

### Solution

**Vérifier le fichier: `backend/src/Security/LoginSuccessHandler.php`**

Il devrait :
1. Créer un `AccessToken` en base de données
2. Générer un JWT signé
3. Retourner JSON avec le token

Code correct :
```php
<?php
namespace App\Security;

use App\Entity\AccessToken;
use App\Service\TokenService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Doctrine\ORM\EntityManagerInterface;

class LoginSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function __construct(
        private TokenService $tokenService,
        private EntityManagerInterface $em
    ) {}

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): Response
    {
        $user = $token->getUser();

        // Create AccessToken in database
        $accessToken = new AccessToken();
        $accessToken->setUser($user);
        $accessToken->setToken($this->tokenService->generateToken());
        $accessToken->setExpiresAt(new \DateTime('+24 hours'));

        $this->em->persist($accessToken);
        $this->em->flush();

        return new JsonResponse([
            'id' => $user->getId(),
            'user' => $user->getUser(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'token' => $accessToken->getToken(),
            'message' => 'Login successful'
        ]);
    }
}
```

### Vérification
- Fais un login
- Regarde la réponse JSON
- Elle devrait contenir : `"token": "eyJ0eXAiOiJKV1QiLCJhbGc..."`

---

## 🧪 Checklist de Débogage

Utilise cet ordre pour identifier le problème :

### Étape 1: Vérifier l'URL d'API
```bash
# Ouvre DevTools (F12) → Network tab
# Fais un login
# Cherche la requête POST
# L'URL devrait être: http://localhost:8080/api/auth/login (ou HTTPS en production)
```

### Étape 2: Vérifier le statut HTTP
```
- 404 Not Found → URL incorrecte (voir PROBLÈME 1)
- 401 Unauthorized → Password incorrect (voir PROBLÈME 2)
- 200 OK → Succès! Vérifier le token dans la réponse
```

### Étape 3: Tester manuellement
```bash
# En local
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user":"testuser","password":"TestAccount123!"}'

# En SSH théâtre
curl -X POST https://mmi.unilim.fr/~cakir4/[...]/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user":"testuser","password":"TestAccount123!"}'
```

Réponse attendue (200 OK) :
```json
{
  "id": 25,
  "user": "testuser",
  "email": "test@example.com",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful"
}
```

### Étape 4: Vérifier le token en localStorage
```javascript
// Dans la console du navigateur (F12 → Console)
localStorage.getItem('auth_token')
// Devrait afficher: eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Étape 5: Tester une requête authentifiée
```bash
# Avec le token
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/posts
```

---

## 📱 Pour le Serveur SSH (MMI)

Applique les mêmes corrections, mais avec les chemins MMI :

### 1. Frontend .env.production
```bash
cd ~/sae4-dweb-di-01-social-Huzeyfe-ckr/frontend

# Édite avec nano
nano .env.production

# Mets:
VITE_API_URL=https://mmi.unilim.fr/~cakir4/sae4-dweb-di-01-social-Huzeyfe-ckr/backend/api
```

### 2. Rebuild et déploie
```bash
npm run build
# Copie dist/* vers le serveur web
scp -r dist/* user@mmi.unilim.fr:~/public_html/sae4-dweb-di-01-social-Huzeyfe-ckr/frontend/
```

### 3. Backend - Ajoute la migration
```bash
cd ~/sae4-dweb-di-01-social-Huzeyfe-ckr/backend

# Crée Version20260320000001.php (voir PROBLÈME 2)
nano migrations/Version20260320000001.php

# Applique
php bin/console doctrine:migrations:migrate --no-interaction
```

### 4. Teste le login
```bash
curl -X POST https://mmi.unilim.fr/~cakir4/sae4-dweb-di-01-social-Huzeyfe-ckr/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user":"testuser","password":"TestAccount123!"}'
```

---

## 🎯 Résumé des Fichiers à Vérifier/Modifier

| Fichier | Local | Serveur SSH | Action |
|---------|-------|-------------|--------|
| `frontend/.env` | ✅ Vérifier | - | `VITE_API_URL=http://localhost:8080/api` |
| `frontend/.env.production` | - | ✅ Vérifier | `VITE_API_URL=https://mmi.unilim.fr/.../backend/api` |
| `backend/migrations/Version*.php` | ✅ Créer | ✅ Créer | Rehashing des passwords |
| `backend/src/Security/JsonLoginAuthenticator.php` | ✅ Vérifier | ✅ Vérifier | Doit valider les passwords hachés |
| `backend/src/Security/LoginSuccessHandler.php` | ✅ Vérifier | ✅ Vérifier | Doit retourner un token JWT |

---

## ✅ Confirmation que Tout Fonctionne

Quand tu auras fait tous les changements :

1. ✅ Login réussit avec le bon password
2. ✅ Token apparaît dans localStorage
3. ✅ GET `/api/posts` retourne les posts (200 OK, pas 401)
4. ✅ Tu peux créer/éditer/supprimer des posts

Si un des tests échoue, reviens à la checklist de débogage ci-dessus.

---

## 📞 Questions Fréquentes

### Q: Pourquoi "Identifiant ou mot de passe incorrect" même avec le bon password?
**R:** Ton mot de passe en base n'est pas hashé correctement. Vois PROBLÈME 2.

### Q: Comment je sais si mon password est hashé ou pas?
**R:** S'il commence par `$2y$` ou `$2a$` ou `$2b$` → hashé ✅ | Sinon → plaintext ❌

### Q: Dois-je réinitialiser les passwords de tous les utilisateurs?
**R:** Oui, applique la migration du PROBLÈME 2 (rehashing automatique).

### Q: Le login fonctionne en local mais pas en SSH?
**R:** C'est probablement une différence dans `VITE_API_URL`. Vérifie `.env.production`.

### Q: Mon frontend envoie encore à `/auth/login` au lieu de `/api/auth/login`?
**R:** Tu as oublié le `/api` dans `.env`. Édite et relance `npm run dev`.

---

## 🔗 Références de Fichiers

- [frontend/src/lib/api.ts](frontend/src/lib/api.ts) — Client API
- [frontend/.env](frontend/.env) — Config locale
- [frontend/.env.production](frontend/.env.production) — Config production
- [backend/src/Security/JsonLoginAuthenticator.php](backend/src/Security/JsonLoginAuthenticator.php) — Validation credentials
- [backend/src/Security/LoginSuccessHandler.php](backend/src/Security/LoginSuccessHandler.php) — Génération token
- [backend/config/packages/security.yaml](backend/config/packages/security.yaml) — Configuration

---

**Dernier update:** 20 Mars 2026
**Statut:** Tous les problèmes identified et solutions fournies ✅
