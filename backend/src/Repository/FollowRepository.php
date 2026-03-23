<?php

namespace App\Repository;

use App\Entity\Follow;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Follow>
 */
class FollowRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Follow::class);
    }

    /**
     * Check if a user follows another user
     */
    public function findByFollowerAndFollowing(int $followerId, int $followingId): ?Follow
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.follower = :follower_id')
            ->andWhere('f.following = :following_id')
            ->setParameter('follower_id', $followerId)
            ->setParameter('following_id', $followingId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Count followers of a user
     */
    public function countFollowers(int $userId): int
    {
        return (int) $this->createQueryBuilder('f')
            ->select('COUNT(f.id)')
            ->andWhere('f.following = :user_id')
            ->setParameter('user_id', $userId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count following of a user
     */
    public function countFollowing(int $userId): int
    {
        return (int) $this->createQueryBuilder('f')
            ->select('COUNT(f.id)')
            ->andWhere('f.follower = :user_id')
            ->setParameter('user_id', $userId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get IDs of users that a user follows
     */
    public function getFollowingIds(int $userId): array
    {
        $result = $this->createQueryBuilder('f')
            ->select('f.following as id')
            ->andWhere('f.follower = :user_id')
            ->setParameter('user_id', $userId)
            ->getQuery()
            ->getResult();

        return array_column($result, 'id');
    }
}
