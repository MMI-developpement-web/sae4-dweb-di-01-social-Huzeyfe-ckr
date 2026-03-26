<?php

namespace App\Repository;

use App\Entity\BlockedUser;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<BlockedUser>
 */
class BlockedUserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BlockedUser::class);
    }

    /**
     * Check if a user has blocked another user
     */
    public function isUserBlocked(int $userId, int $blockedUserId): bool
    {
        $result = $this->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->where('b.user = :userId')
            ->andWhere('b.blockedUser = :blockedUserId')
            ->setParameter('userId', $userId)
            ->setParameter('blockedUserId', $blockedUserId)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Get all blocked users for a user
     */
    public function findBlockedByUser(int $userId): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Block a user
     */
    public function blockUser(int $userId, int $blockedUserId): BlockedUser
    {
        // Check if already blocked
        $existing = $this->createQueryBuilder('b')
            ->where('b.user = :userId')
            ->andWhere('b.blockedUser = :blockedUserId')
            ->setParameter('userId', $userId)
            ->setParameter('blockedUserId', $blockedUserId)
            ->getQuery()
            ->getOneOrNullResult();

        if ($existing) {
            return $existing;
        }

        // Create new block
        $blockedUser = new BlockedUser();
        $user = $this->getEntityManager()->getReference('App\Entity\User', $userId);
        $blocked = $this->getEntityManager()->getReference('App\Entity\User', $blockedUserId);
        
        $blockedUser->setUser($user);
        $blockedUser->setBlockedUser($blocked);
        
        $this->getEntityManager()->persist($blockedUser);
        $this->getEntityManager()->flush();

        return $blockedUser;
    }

    /**
     * Unblock a user
     */
    public function unblockUser(int $userId, int $blockedUserId): bool
    {
        $result = $this->createQueryBuilder('b')
            ->delete()
            ->where('b.user = :userId')
            ->andWhere('b.blockedUser = :blockedUserId')
            ->setParameter('userId', $userId)
            ->setParameter('blockedUserId', $blockedUserId)
            ->getQuery()
            ->execute();

        return $result > 0;
    }
}
