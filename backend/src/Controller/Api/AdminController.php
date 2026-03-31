<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Repository\PostRepository;
use App\Repository\LikeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/admin')]
class AdminController extends AbstractController
{
    /**
     * Formate un post pour la réponse JSON (copie de PostController)
     */
    private function formatPost(Post $p, LikeRepository $likeRepository, PostRepository $postRepository): array
    {
        if ($p->isCensored()) {
            return [
                'id' => $p->getId(),
                'content' => 'Ce message enfreint les conditions d\'utilisation de la plateforme',
                'time' => $p->getTime()?->format('Y-m-d'),
                'createdAt' => $p->getCreatedAt()->format(\DateTime::ATOM),
                'mediaUrl' => $p->getMediaUrl(),
                'user' => $p->getUser() ? [
                    'id' => $p->getUser()->getId(),
                    'name' => $p->getUser()->getName(),
                    'user' => $p->getUser()->getUser(),
                    'pp' => $p->getUser()->getPp(),
                    'blocked' => $p->getUser()->isBlocked(),
                    'readOnly' => false,
                ] : null,
                'likes' => 0,
                'liked' => false,
                'retweets' => 0,
                'retweeted' => false,
                'censored' => true,
                'retweetedFrom' => null,
            ];
        }

        $likeCount = $likeRepository->countByPostExcludingBlocked($p->getId());
        $userLiked = false;
        $retweetCount = $postRepository->countRetweets($p->getId());
        $userRetweeted = false;
        
        if ($this->getUser()) {
            $userLiked = (bool) $likeRepository->findByUserAndPost($this->getUser()->getId(), $p->getId());
            $userRetweeted = (bool) $postRepository->findRetweetByUser($p->getId(), $this->getUser()->getId());
        }

        return [
            'id' => $p->getId(),
            'content' => $p->getContent(),
            'time' => $p->getTime()?->format('Y-m-d'),
            'createdAt' => $p->getCreatedAt()->format(\DateTime::ATOM),
            'mediaUrl' => $p->getMediaUrl(),
            'user' => $p->getUser() ? [
                'id' => $p->getUser()->getId(),
                'name' => $p->getUser()->getName(),
                'user' => $p->getUser()->getUser(),
                'pp' => $p->getUser()->getPp(),
                'blocked' => $p->getUser()->isBlocked(),
                'readOnly' => $p->getUser()->isReadOnly(),
            ] : null,
            'likes' => $likeCount,
            'liked' => $userLiked,
            'retweets' => $retweetCount,
            'retweeted' => $userRetweeted,
            'censored' => $p->isCensored(),
        ];
    }

    /**
     * Toggle post censorship (admin only)
     * POST /api/admin/posts/{id}/censor (to censor)
     * DELETE /api/admin/posts/{id}/censor (to uncensor)
     */
    #[Route('/posts/{id}/censor', name: 'admin.posts.censor', methods: ['POST', 'DELETE'])]
    public function censorPost(Post $post, Request $request, EntityManagerInterface $em, LikeRepository $likeRepository, PostRepository $postRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $method = $request->getMethod();
        
        if ($method === 'POST') {
            // Censor the post
            $post->setCensored(true);
        } else {
            // Uncensor the post
            $post->setCensored(false);
        }

        $em->flush();

        // Return the updated post
        return $this->json($this->formatPost($post, $likeRepository, $postRepository));
    }
}
