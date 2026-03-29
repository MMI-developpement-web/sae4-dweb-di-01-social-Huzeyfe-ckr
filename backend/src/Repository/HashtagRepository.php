<?php

namespace App\Repository;

use App\Entity\Hashtag;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Hashtag>
 *
 * @method Hashtag|null find($id, $lockMode = null, $lockVersion = null)
 * @method Hashtag|null findOneBy(array $criteria, array $orderBy = null)
 * @method Hashtag[]    findAll()
 * @method Hashtag[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class HashtagRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Hashtag::class);
    }

    /**
     * Find or create a hashtag by name
     */
    public function findOrCreate(string $name): Hashtag
    {
        // Normalize the name (lowercase, remove #)
        $normalizedName = strtolower(ltrim($name, '#'));

        $hashtag = $this->findOneBy(['name' => $normalizedName]);

        if (!$hashtag) {
            $hashtag = new Hashtag();
            $hashtag->setName($normalizedName);
            $this->getEntityManager()->persist($hashtag);
            $this->getEntityManager()->flush();
        }

        return $hashtag;
    }

    /**
     * Find posts by hashtag name (without #)
     */
    public function findPostsByHashtag(string $name): array
    {
        $normalizedName = strtolower(ltrim($name, '#'));

        $hashtag = $this->findOneBy(['name' => $normalizedName]);
        if (!$hashtag) {
            return [];
        }

        return $hashtag->getPosts()->toArray();
    }

    /**
     * Find trending hashtags (most used)
     */
    public function findTrendingHashtags(int $limit = 10): array
    {
        return $this->createQueryBuilder('h')
            ->leftJoin('h.posts', 'p')
            ->groupBy('h.id')
            ->orderBy('COUNT(p.id)', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Search hashtags by partial name
     */
    public function searchByName(string $query): array
    {
        $normalizedQuery = strtolower(ltrim($query, '#'));

        return $this->createQueryBuilder('h')
            ->where('h.name LIKE :query')
            ->setParameter('query', '%' . $normalizedQuery . '%')
            ->orderBy('h.createdAt', 'DESC')
            ->setMaxResults(20)
            ->getQuery()
            ->getResult();
    }
}
