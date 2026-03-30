<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\User;
use App\Entity\Like;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Repository\LikeRepository;
use App\Repository\FollowRepository;
use App\Repository\BlockedUserRepository;
use App\Service\HashtagService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/posts')]
class PostController extends AbstractController
{
    /**
     * Formate un post pour la réponse JSON, incluant les infos du retweet original si applicable
     */
    private function formatPost(Post $p, LikeRepository $likeRepository, PostRepository $postRepository, ?User $currentUser = null): array
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
        
        if ($currentUser) {
            $userLiked = (bool) $likeRepository->findByUserAndPost($currentUser->getId(), $p->getId());
            $userRetweeted = (bool) $postRepository->findRetweetByUser($p->getId(), $currentUser->getId());
        }

        // Formater le post original si c'est un retweet
        $retweetedFrom = null;
        if ($p->getRetweetedFrom()) {
            $originalPost = $p->getRetweetedFrom();
            $originalLikeCount = $likeRepository->countByPostExcludingBlocked($originalPost->getId());
            $originalRetweetCount = $postRepository->countRetweets($originalPost->getId());
            $originalUserLiked = false;
            $originalUserRetweeted = false;
            
            if ($currentUser) {
                $originalUserLiked = (bool) $likeRepository->findByUserAndPost($currentUser->getId(), $originalPost->getId());
                $originalUserRetweeted = (bool) $postRepository->findRetweetByUser($originalPost->getId(), $currentUser->getId());
            }

            $retweetedFrom = [
                'id' => $originalPost->getId(),
                'content' => $originalPost->getContent(),
                'time' => $originalPost->getTime()?->format('Y-m-d'),
                'createdAt' => $originalPost->getCreatedAt()->format(\DateTime::ATOM),
                'mediaUrl' => $originalPost->getMediaUrl(),
                'user' => $originalPost->getUser() ? [
                    'id' => $originalPost->getUser()->getId(),
                    'name' => $originalPost->getUser()->getName(),
                    'user' => $originalPost->getUser()->getUser(),
                    'pp' => $originalPost->getUser()->getPp(),
                    'blocked' => $originalPost->getUser()->isBlocked(),
                    'readOnly' => $originalPost->getUser()->isReadOnly(),
                ] : null,
                'likes' => $originalLikeCount,
                'liked' => $originalUserLiked,
                'retweets' => $originalRetweetCount,
                'retweeted' => $originalUserRetweeted,
            ];
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
            'censored' => false,
            'retweetedFrom' => $retweetedFrom,
        ];
    }

    /**
     * Récupère tous les posts avec les infos utilisateur
     * GET /api/posts?filter=following (optionnel: retourne seulement les posts des utilisateurs suivis)
     */
    #[Route('', name: 'posts.all', methods: ['GET'])]
    public function all(Request $request, PostRepository $postRepository, LikeRepository $likeRepository, FollowRepository $followRepository): JsonResponse
    {
        $currentUser = $this->getUser();
        $filter = $request->query->get('filter', 'all');

        $posts = $postRepository->findAll();

        // Filtrer par "following" si demandé
        if ($filter === 'following' && $currentUser instanceof User) {
            $followingIds = $followRepository->getFollowingIds($currentUser->getId());
            $posts = array_filter($posts, function(Post $p) use ($followingIds) {
                return in_array($p->getUser()->getId(), $followingIds);
            });
        }

        // Trier par date décroissante
        usort($posts, function(Post $a, Post $b) {
            return $b->getCreatedAt()->getTimestamp() - $a->getCreatedAt()->getTimestamp();
        });

        $currentUser = $this->getUser();
        $result = array_map(fn(Post $p) => $this->formatPost($p, $likeRepository, $postRepository, $currentUser), $posts);

        return $this->json(['posts' => $result]);
    }

    /**
     * Récupère un post spécifique
     * GET /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.get', methods: ['GET'])]
    public function get(Post $post, LikeRepository $likeRepository, PostRepository $postRepository): JsonResponse
    {
        return $this->json($this->formatPost($post, $likeRepository, $postRepository, $this->getUser()));
    }

    /**
     * Création d'un post
     * POST /api/posts
     */
    #[Route('', name: 'posts.create', methods: ['POST'])]
    public function create(Request $request, UserRepository $userRepository, EntityManagerInterface $em, HashtagService $hashtagService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['content']) || !isset($data['userId'])) {
            return $this->json(['error' => 'content et userId sont requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->find($data['userId']);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Empêcher les utilisateurs bloqués de publier
        if ($user->isBlocked()) {
            return $this->json(['error' => 'Cet utilisateur est bloqué'], Response::HTTP_FORBIDDEN);
        }

        $post = new Post();
        $post->setContent($data['content']);
        $post->setUser($user);
        $post->setCreatedAt(new \DateTime());

        if (isset($data['time'])) {
            $post->setTime(new \DateTime($data['time']));
        }

        // Ajouter mediaUrl s'il est fourni
        if (isset($data['mediaUrl']) && !empty($data['mediaUrl'])) {
            $post->setMediaUrl($data['mediaUrl']);
        }

        $em->persist($post);
        $em->flush();

        // Extract and apply hashtags
        $hashtagService->extractAndApplyHashtags($post);

        $response = [
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
            ] : null,
            'hashtags' => $post->getHashtags()->map(fn($h) => ['id' => $h->getId(), 'name' => $h->getName()])->toArray(),
        ];

        return $this->json($response, Response::HTTP_CREATED);
    }

    /**
     * Remplace un post (PUT)
     * PUT /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.update', methods: ['PUT'])]
    public function update(Post $post, Request $request, EntityManagerInterface $em, SerializerInterface $serializer, HashtagService $hashtagService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['content'])) {
            $post->setContent($data['content']);
        }

        if (isset($data['time'])) {
            $post->setTime(new \DateTime($data['time']));
        }

        $em->flush();

        // Extract and apply hashtags if content was updated
        if (isset($data['content'])) {
            $hashtagService->extractAndApplyHashtags($post);
        }

        $json = $serializer->serialize($post, 'json', ['groups' => 'detail']);
        return new JsonResponse(json_decode($json, true));
    }

    /**
     * Patch partiel d'un post (PATCH)
     * PATCH /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.patch', methods: ['PATCH'])]
    public function patch(Post $post, Request $request, EntityManagerInterface $em, SerializerInterface $serializer, HashtagService $hashtagService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['content'])) {
            $post->setContent($data['content']);
        }

        if (isset($data['time'])) {
            $post->setTime(new \DateTime($data['time']));
        }

        $em->flush();

        // Extract and apply hashtags if content was updated
        if (isset($data['content'])) {
            $hashtagService->extractAndApplyHashtags($post);
        }

        $json = $serializer->serialize($post, 'json', ['groups' => 'detail']);
        return new JsonResponse(json_decode($json, true));
    }

    /**
     * Supprime un post
     * DELETE /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.delete', methods: ['DELETE'])]
    public function delete(Post $post, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($post);
        $em->flush();

        return $this->json(['message' => 'Post supprimé'], Response::HTTP_NO_CONTENT);
    }

    /**
     * Aime un post
     * POST /api/posts/{id}/like
     */
    #[Route('/{id}/like', name: 'posts.like', methods: ['POST'])]
    public function like(Post $post, UserRepository $userRepository, LikeRepository $likeRepository, BlockedUserRepository $blockedUserRepository, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur est en mode lecture seule
        if ($user->isReadOnly()) {
            return $this->json(['error' => 'Vous êtes en mode lecture seule et ne pouvez pas liker'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur actuel est bloqué par l'auteur du post
        if ($blockedUserRepository->isUserBlocked($post->getUser()->getId(), $user->getId())) {
            return $this->json(['error' => 'Vous êtes bloqué par l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur actuel bloque l'auteur du post
        if ($blockedUserRepository->isUserBlocked($user->getId(), $post->getUser()->getId())) {
            return $this->json(['error' => 'Vous avez bloqué l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur a déjà liké ce post
        $existingLike = $likeRepository->findByUserAndPost($user->getId(), $post->getId());
        if ($existingLike) {
            return $this->json(['error' => 'Vous avez déjà liké ce post'], Response::HTTP_CONFLICT);
        }

        // Créer un nouveau like
        $like = new Like();
        $like->setUser($user);
        $like->setPost($post);

        $em->persist($like);
        $em->flush();

        // Compter les likes du post (excluant les utilisateurs bloqués)
        $likeCount = $likeRepository->countByPostExcludingBlocked($post->getId());

        return $this->json(['message' => 'Post liké', 'likes' => $likeCount], Response::HTTP_CREATED);
    }

    /**
     * Retire un like d'un post
     * DELETE /api/posts/{id}/like
     */
    #[Route('/{id}/like', name: 'posts.unlike', methods: ['DELETE'])]
    public function unlike(Post $post, LikeRepository $likeRepository, BlockedUserRepository $blockedUserRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur actuel est bloqué par l'auteur du post
        if ($blockedUserRepository->isUserBlocked($post->getUser()->getId(), $user->getId())) {
            return $this->json(['error' => 'Vous êtes bloqué par l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur actuel bloque l'auteur du post
        if ($blockedUserRepository->isUserBlocked($user->getId(), $post->getUser()->getId())) {
            return $this->json(['error' => 'Vous avez bloqué l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        // Trouver le like à supprimer
        $like = $likeRepository->findByUserAndPost($user->getId(), $post->getId());
        if (!$like) {
            return $this->json(['error' => 'Vous n\'avez pas liké ce post'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($like);
        $em->flush();

        // Compter les likes du post (excluant les utilisateurs bloqués)
        $likeCount = $likeRepository->countByPostExcludingBlocked($post->getId());

        return $this->json(['message' => 'Like supprimé', 'likes' => $likeCount], Response::HTTP_OK);
    }

    /**
     * Retweet a post
     * POST /api/posts/{id}/retweet
     * Body: { "comment": "optional comment" }
     */
    #[Route('/{id}/retweet', name: 'posts.retweet', methods: ['POST'])]
    public function retweet(Post $post, Request $request, PostRepository $postRepository, EntityManagerInterface $em, BlockedUserRepository $blockedUserRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur est en mode lecture seule
        if ($user->isReadOnly()) {
            return $this->json(['error' => 'Vous êtes en mode lecture seule et ne pouvez pas retweeter'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur actuel est bloqué par l'auteur du post
        if ($blockedUserRepository->isUserBlocked($post->getUser()->getId(), $user->getId())) {
            return $this->json(['error' => 'Vous êtes bloqué par l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur actuel bloque l'auteur du post
        if ($blockedUserRepository->isUserBlocked($user->getId(), $post->getUser()->getId())) {
            return $this->json(['error' => 'Vous avez bloqué l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur a déjà retweeté ce post
        $existingRetweet = $postRepository->findRetweetByUser($post->getId(), $user->getId());
        if ($existingRetweet) {
            return $this->json(['error' => 'Vous avez déjà retweeté ce post'], Response::HTTP_CONFLICT);
        }

        // Créer une copie du post (retweet)
        $retweet = new Post();
        $retweet->setUser($user);
        $retweet->setContent($post->getContent());
        $retweet->setTime($post->getTime());
        $retweet->setMediaUrl($post->getMediaUrl());
        $retweet->setRetweetedFrom($post); // Référence l'original
        $retweet->setCreatedAt(new \DateTime());

        // Ajouter le commentaire optionnel
        $data = json_decode($request->getContent(), true);
        if ($data && isset($data['comment']) && !empty($data['comment'])) {
            $retweet->setRetweetComment($data['comment']);
        }

        $em->persist($retweet);
        $em->flush();

        return $this->json([
            'message' => 'Post retweeté',
            'retweet' => [
                'id' => $retweet->getId(),
                'content' => $retweet->getContent(),
                'retweetedFrom' => [
                    'id' => $post->getId(),
                    'user' => [
                        'id' => $post->getUser()->getId(),
                        'name' => $post->getUser()->getName(),
                        'user' => $post->getUser()->getUser(),
                    ]
                ]
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * Remove a retweet
     * DELETE /api/posts/{id}/retweet
     */
    #[Route('/{id}/retweet', name: 'posts.unRetweet', methods: ['DELETE'])]
    public function unRetweet(Post $post, PostRepository $postRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Trouver le retweet de cet utilisateur pour ce post
        $retweet = $postRepository->findRetweetByUser($post->getId(), $user->getId());
        if (!$retweet) {
            return $this->json(['error' => 'Vous n\'avez pas retweeté ce post'], Response::HTTP_NOT_FOUND);
        }

        // Supprimer le retweet
        $em->remove($retweet);
        $em->flush();

        return $this->json(['message' => 'Retweet supprimé'], Response::HTTP_OK);
    }
}
