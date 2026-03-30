<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Repository\LikeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/search')]
class SearchController extends AbstractController
{
    /**
     * Search posts and users
     * GET /api/search?q=keyword&type=all|posts|users&sort=date|relevance&startDate=2026-01-01&endDate=2026-12-31
     */
    #[Route('', name: 'search.all', methods: ['GET'])]
    public function search(
        Request $request,
        PostRepository $postRepository,
        UserRepository $userRepository,
        LikeRepository $likeRepository
    ): JsonResponse {
        $query = $request->query->get('q', '');
        $type = $request->query->get('type', 'all'); // all, posts, users
        $sort = $request->query->get('sort', 'date');
        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        $currentUser = $this->getUser();

        if (strlen($query) < 1) {
            return $this->json([
                'posts' => [],
                'users' => [],
                'query' => $query,
                'type' => $type,
            ]);
        }

        $posts = [];
        $users = [];

        // Search posts
        if (in_array($type, ['all', 'posts'])) {
            $posts = $this->searchPosts(
                $query,
                $postRepository,
                $likeRepository,
                $currentUser,
                $startDate,
                $endDate,
                $sort
            );
        }

        // Search users
        if (in_array($type, ['all', 'users'])) {
            $users = $this->searchUsers($query, $userRepository);
        }

        return $this->json([
            'posts' => $posts,
            'users' => $users,
            'query' => $query,
            'type' => $type,
            'postCount' => count($posts),
            'userCount' => count($users),
        ]);
    }

    /**
     * Search posts by keyword
     */
    private function searchPosts(
        string $query,
        PostRepository $postRepository,
        LikeRepository $likeRepository,
        ?User $currentUser,
        ?string $startDate,
        ?string $endDate,
        string $sort
    ): array {
        // Search using LIKE in content or username
        $qb = $postRepository->createQueryBuilder('p')
            ->leftJoin('p.user', 'u')
            ->where('p.content LIKE :query OR u.name LIKE :query OR u.user LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->andWhere('p.censored = false');

        // Filter by date if provided
        if ($startDate) {
            $qb->andWhere('p.createdAt >= :startDate')
                ->setParameter('startDate', new \DateTime($startDate));
        }
        if ($endDate) {
            $qb->andWhere('p.createdAt <= :endDate')
                ->setParameter('endDate', new \DateTime($endDate . ' 23:59:59'));
        }

        // Sort by date (most recent first) or by relevance (default: date)
        if ($sort === 'relevance') {
            // Simple relevance: prioritize exact matches and exact case matches
            $qb->orderBy('CASE WHEN p.content LIKE :exactQuery THEN 0 ELSE 1 END', 'ASC')
                ->addOrderBy('p.createdAt', 'DESC')
                ->setParameter('exactQuery', $query);
        } else {
            $qb->orderBy('p.createdAt', 'DESC');
        }

        $foundPosts = $qb->getQuery()->getResult();

        // Format response
        $result = array_map(function(Post $post) use ($likeRepository, $currentUser) {
            if ($post->isCensored()) {
                return [
                    'id' => $post->getId(),
                    'content' => 'Ce message enfreint les conditions d\'utilisation de la plateforme',
                    'time' => $post->getTime()?->format('Y-m-d'),
                    'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                    'mediaUrl' => $post->getMediaUrl(),
                    'user' => $post->getUser() ? [
                        'id' => $post->getUser()->getId(),
                        'name' => $post->getUser()->getName(),
                        'user' => $post->getUser()->getUser(),
                        'pp' => $post->getUser()->getPp(),
                        'blocked' => $post->getUser()->isBlocked(),
                        'readOnly' => $post->getUser()->isReadOnly(),
                    ] : null,
                    'likes' => 0,
                    'liked' => false,
                    'censored' => true,
                ];
            }

            $likeCount = $likeRepository->countByPostExcludingBlocked($post->getId());
            $userLiked = false;
            if ($currentUser) {
                $userLiked = (bool) $likeRepository->findByUserAndPost($currentUser->getId(), $post->getId());
            }

            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'time' => $post->getTime()?->format('Y-m-d'),
                'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
                'mediaUrl' => $post->getMediaUrl(),
                'user' => $post->getUser() ? [
                    'id' => $post->getUser()->getId(),
                    'name' => $post->getUser()->getName(),
                    'user' => $post->getUser()->getUser(),
                    'pp' => $post->getUser()->getPp(),
                    'blocked' => $post->getUser()->isBlocked(),
                    'readOnly' => $post->getUser()->isReadOnly(),
                ] : null,
                'likes' => $likeCount,
                'liked' => $userLiked,
                'censored' => false,
            ];
        }, $foundPosts);

        return $result;
    }

    /**
     * Search users by name or username
     */
    private function searchUsers(string $query, UserRepository $userRepository): array {
        $foundUsers = $userRepository->createQueryBuilder('u')
            ->where('u.name LIKE :query OR u.user LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->andWhere('u.role != :admin')
            ->setParameter('admin', 'admin')
            ->orderBy('u.name', 'ASC')
            ->setMaxResults(20)
            ->getQuery()
            ->getResult();

        return array_map(function(User $u) {
            return [
                'id' => $u->getId(),
                'name' => $u->getName(),
                'user' => $u->getUser(),
                'pp' => $u->getPp(),
                'blocked' => $u->isBlocked(),
                'readOnly' => $u->isReadOnly(),
                'bio' => $u->getBio(),
            ];
        }, $foundUsers);
    }
}
