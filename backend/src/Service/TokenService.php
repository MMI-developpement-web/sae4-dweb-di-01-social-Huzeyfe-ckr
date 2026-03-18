<?php

namespace App\Service;

use App\Entity\AccessToken;
use App\Entity\User;
use App\Repository\AccessTokenRepository;
use Doctrine\ORM\EntityManagerInterface;

class TokenService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private AccessTokenRepository $tokenRepository
    ) {
    }

    /**
     * Génère un nouveau token et le stocke en base
     * Supprime l'ancien token s'il existe
     */
    public function generateToken(User $user, ?\DateTimeImmutable $expiresAt = null): string
    {
        // Supprimer l'ancien token s'il existe
        $oldToken = $user->getAccessToken();
        if ($oldToken) {
            // Détacher l'utilisateur du token (important pour la contrainte UNIQUE)
            $user->setAccessToken(null);
            $this->entityManager->remove($oldToken);
            $this->entityManager->flush();
        }

        // Générer un nouveau token brut
        $rawToken = bin2hex(random_bytes(32));
        
        // Hacher le token
        $hashedToken = hash('sha256', $rawToken);

        // Créer l'entité token
        $token = new AccessToken();
        $token->setValue($rawToken);
        $token->setHashedValue($hashedToken);
        $token->setUser($user);
        $token->setCreatedAt(new \DateTimeImmutable());
        
        if ($expiresAt !== null) {
            $token->setExpiresAt($expiresAt);
        }

        // Persister et flush
        $this->entityManager->persist($token);
        $this->entityManager->flush();

        // Retourner le token brut
        return $rawToken;
    }

    /**
     * Valide un token en comparant sa valeur hachée
     * Retourne l'utilisateur associé si valide, null sinon
     */
    public function validateToken(string $rawToken): ?User
    {
        // Hacher le token reçu
        $hashedToken = hash('sha256', $rawToken);

        // Chercher le token en base
        $token = $this->tokenRepository->findByHashedValue($hashedToken);

        if (!$token) {
            return null;
        }

        // Vérifier l'expiration
        if ($token->isExpired()) {
            return null;
        }

        // Retourner l'utilisateur
        return $token->getUser();
    }

    /**
     * Supprime le token d'un utilisateur
     */
    public function revokeToken(User $user): void
    {
        $token = $user->getAccessToken();
        if ($token) {
            $this->entityManager->remove($token);
            $this->entityManager->flush();
        }
    }
}
