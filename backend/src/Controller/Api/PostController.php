<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
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
     * GET /api/posts
     */
    #[Route('', name: 'posts.all', methods: ['GET'])]
    public function all(PostRepository $postRepository): JsonResponse
    {
        $posts = $postRepository->findAll();

        $result = array_map(function(Post $p) {
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
            ];
        }, $posts);

        return $this->json(['posts' => $result]);
    }

    /**
     * Récupère un post spécifique
     * GET /api/posts/{id}
     */
    #[Route('/{id}', name: 'posts.get', methods: ['GET'])]
    public function get(Post $post): JsonResponse
    {
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
}
