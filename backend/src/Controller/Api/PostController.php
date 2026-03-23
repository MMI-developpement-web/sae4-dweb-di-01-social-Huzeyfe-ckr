<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\User;
use App\Entity\Like;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Repository\LikeRepository;
use App\Repository\FollowRepository;
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

        // Filtrer les posts des utilisateurs bloqués
        $posts = array_filter($posts, function(Post $p) {
            return !$p->getUser()->isBlocked();
        });

        // Trier par date décroissante
        usort($posts, function(Post $a, Post $b) {
            return $b->getCreatedAt()->getTimestamp() - $a->getCreatedAt()->getTimestamp();
        });

        $result = array_map(function(Post $p) use ($likeRepository, $currentUser) {
            $likeCount = $likeRepository->countByPost($p->getId());
            $userLiked = false;
            if ($currentUser) {
                $userLiked = (bool) $likeRepository->findByUserAndPost($currentUser->getId(), $p->getId());
            }

            return [
                'id' => $p->getId(),
                'content' => $p->getContent(),
                'time' => $p->getTime()?->format('Y-m-d'),
                'createdAt' => $p->getCreatedAt()->format(\DateTime::ATOM),
                'user' => $p->getUser() ? [
                    'id' => $p->getUser()->getId(),
                    'name' => $p->getUser()->getName(),
                    'user' => $p->getUser()->getUser(),
                    'pp' => $p->getUser()->getPp(),
                ] : null,
                'likes' => $likeCount,
                'liked' => $userLiked,
            ];
        }, $posts);

        return $this->json(['posts' => $result]);
    }

    /**
     * Récupère un post spécifique
     * GET /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.get', methods: ['GET'])]
    public function get(Post $post, LikeRepository $likeRepository): JsonResponse
    {
        // Si l'utilisateur du post est bloqué, retourner une erreur
        if ($post->getUser()->isBlocked()) {
            return $this->json(
                ['error' => 'Ce compte a été bloqué pour non respect des conditions d\'utilisation'],
                Response::HTTP_FORBIDDEN
            );
        }

        $currentUser = $this->getUser();
        $likeCount = $likeRepository->countByPost($post->getId());
        $userLiked = false;
        if ($currentUser) {
            $userLiked = (bool) $likeRepository->findByUserAndPost($currentUser->getId(), $post->getId());
        }

        $data = [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'time' => $post->getTime()?->format('Y-m-d'),
            'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
            'user' => $post->getUser() ? [
                'id' => $post->getUser()->getId(),
                'name' => $post->getUser()->getName(),
                'user' => $post->getUser()->getUser(),
                'pp' => $post->getUser()->getPp(),
            ] : null,
            'likes' => $likeCount,
            'liked' => $userLiked,
        ];

        return $this->json($data);
    }

    /**
     * Création d'un post
     * POST /api/posts
     */
    #[Route('', name: 'posts.create', methods: ['POST'])]
    public function create(Request $request, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
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

        $em->persist($post);
        $em->flush();

        $response = [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'time' => $post->getTime()?->format('Y-m-d'),
            'createdAt' => $post->getCreatedAt()->format(\DateTime::ATOM),
            'user' => $post->getUser() ? [
                'id' => $post->getUser()->getId(),
                'name' => $post->getUser()->getName(),
                'user' => $post->getUser()->getUser(),
                'pp' => $post->getUser()->getPp(),
            ] : null,
        ];

        return $this->json($response, Response::HTTP_CREATED);
    }

    /**
     * Remplace un post (PUT)
     * PUT /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.update', methods: ['PUT'])]
    public function update(Post $post, Request $request, EntityManagerInterface $em, SerializerInterface $serializer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['content'])) {
            $post->setContent($data['content']);
        }

        if (isset($data['time'])) {
            $post->setTime(new \DateTime($data['time']));
        }

        $em->flush();

        $json = $serializer->serialize($post, 'json', ['groups' => 'detail']);
        return new JsonResponse(json_decode($json, true));
    }

    /**
     * Patch partiel d'un post (PATCH)
     * PATCH /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.patch', methods: ['PATCH'])]
    public function patch(Post $post, Request $request, EntityManagerInterface $em, SerializerInterface $serializer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['content'])) {
            $post->setContent($data['content']);
        }

        if (isset($data['time'])) {
            $post->setTime(new \DateTime($data['time']));
        }

        $em->flush();

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
    public function like(Post $post, UserRepository $userRepository, LikeRepository $likeRepository, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Empêcher les likes sur les posts des utilisateurs bloqués
        if ($post->getUser()->isBlocked()) {
            return $this->json(['error' => 'Impossible de liker ce post'], Response::HTTP_FORBIDDEN);
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

        // Compter les likes du post
        $likeCount = $likeRepository->countByPost($post->getId());

        return $this->json(['message' => 'Post liké', 'likes' => $likeCount], Response::HTTP_CREATED);
    }

    /**
     * Retire un like d'un post
     * DELETE /api/posts/{id}/like
     */
    #[Route('/{id}/like', name: 'posts.unlike', methods: ['DELETE'])]
    public function unlike(Post $post, LikeRepository $likeRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Trouver le like à supprimer
        $like = $likeRepository->findByUserAndPost($user->getId(), $post->getId());
        if (!$like) {
            return $this->json(['error' => 'Vous n\'avez pas liké ce post'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($like);
        $em->flush();

        // Compter les likes du post
        $likeCount = $likeRepository->countByPost($post->getId());

        return $this->json(['message' => 'Like supprimé', 'likes' => $likeCount], Response::HTTP_OK);
    }
}
