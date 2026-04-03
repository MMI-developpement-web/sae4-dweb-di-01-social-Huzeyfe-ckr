<?php

namespace App\Controller\Api;

use App\Repository\HashtagRepository;
use App\Repository\LikeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/hashtags')]
class HashtagController extends AbstractController
{
    /**
     * Search posts by hashtag name
     * GET /api/hashtags/{name}/posts
     */
    #[Route('/{name}/posts', name: 'hashtags.posts', methods: ['GET'])]
    public function getPostsByHashtag(
        string $name,
        HashtagRepository $hashtagRepository,
        LikeRepository $likeRepository
    ): JsonResponse {
        $currentUser = $this->getUser();

        // Find the hashtag
        $hashtag = $hashtagRepository->findOneBy(['name' => strtolower(ltrim($name, '#'))]);

        if (!$hashtag) {
            return $this->json(['posts' => [], 'hashtag' => $name]);
        }

        // Get posts for this hashtag
        $posts = $hashtag->getPosts()->toArray();

        // Sort by date descending
        usort($posts, function($a, $b) {
            return $b->getCreatedAt()->getTimestamp() - $a->getCreatedAt()->getTimestamp();
        });

        // Format response
        $result = array_map(function($post) use ($likeRepository, $currentUser) {
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
                ] : null,
                'likes' => $likeCount,
                'liked' => $userLiked,
                'censored' => false,
            ];
        }, $posts);

        return $this->json([
            'hashtag' => $hashtag->getName(),
            'postCount' => count($result),
            'posts' => $result,
        ]);
    }

    /**
     * Get trending hashtags
     * GET /api/hashtags/trending
     */
    #[Route('/trending', name: 'hashtags.trending', methods: ['GET'])]
    public function getTrendingHashtags(
        Request $request,
        HashtagRepository $hashtagRepository
    ): JsonResponse {
        $limit = $request->query->getInt('limit', 10);

        $hashtags = $hashtagRepository->findTrendingHashtags($limit);

        $result = array_map(function($hashtag) {
            return [
                'id' => $hashtag->getId(),
                'name' => $hashtag->getName(),
                'postCount' => $hashtag->getPosts()->count(),
                'createdAt' => $hashtag->getCreatedAt()->format(\DateTime::ATOM),
            ];
        }, $hashtags);

        return $this->json(['hashtags' => $result]);
    }

    /**
     * Search hashtags by partial name (autocomplete)
     * GET /api/hashtags/search?q=travel
     */
    #[Route('/search', name: 'hashtags.search', methods: ['GET'])]
    public function searchHashtags(
        Request $request,
        HashtagRepository $hashtagRepository
    ): JsonResponse {
        $query = $request->query->get('q', '');

        if (strlen($query) < 1) {
            return $this->json(['hashtags' => []]);
        }

        $hashtags = $hashtagRepository->searchByName($query);

        $result = array_map(function($hashtag) {
            return [
                'id' => $hashtag->getId(),
                'name' => $hashtag->getName(),
                'postCount' => $hashtag->getPosts()->count(),
            ];
        }, $hashtags);

        return $this->json(['hashtags' => $result]);
    }
}
