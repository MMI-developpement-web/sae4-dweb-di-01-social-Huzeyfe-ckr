<?php

namespace App\Repository;

use App\Entity\AccessToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AccessToken>
 */
class AccessTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AccessToken::class);
    }

    public function findByValue(string $value): ?AccessToken
    {
        return $this->findOneBy(['value' => $value]);
    }

    public function findByHashedValue(string $hashedValue): ?AccessToken
    {
        return $this->findOneBy(['hashedValue' => $hashedValue]);
    }

    public function findValidTokenByUser($user): ?AccessToken
    {
        $token = $this->findOneBy(['user' => $user]);
        
        if ($token && !$token->isExpired()) {
            return $token;
        }

        return null;
    }
}
