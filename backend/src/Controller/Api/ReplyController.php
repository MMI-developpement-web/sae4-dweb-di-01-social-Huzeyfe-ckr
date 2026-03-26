<?php

namespace App\Controller\Api;

use App\Entity\Reply;
use App\Entity\Post;
use App\Repository\ReplyRepository;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Repository\BlockedUserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route('/api')]
class ReplyController extends AbstractController
{
    public function __construct(
        private ReplyRepository $replyRepository,
        private PostRepository $postRepository,
        private UserRepository $userRepository,
        private BlockedUserRepository $blockedUserRepository,
        private EntityManagerInterface $entityManager,
    ) {}

    /**
     * GET /api/posts/{id}/replies
     * Retrieve all replies for a specific post
     */
    #[Route('/posts/{id}/replies', name: 'api_get_replies', methods: ['GET'])]
    public function getReplies(int $id): JsonResponse
    {
        // Verify post exists
        $post = $this->postRepository->find($id);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Get current user if authenticated
        $currentUser = $this->getUser();

        // Fetch replies ordered by creation date DESC (newest first)
        $replies = $this->replyRepository->findByPost($id);

        // Serialize with API groups
        $data = [];
        foreach ($replies as $reply) {
            $replyUser = $reply->getUser();
            $replyData = [
                'id' => $reply->getId(),
                'postId' => $reply->getPost()->getId(),
                'user' => [
                    'id' => $replyUser->getId(),
                    'username' => $replyUser->getUser(),
                    'displayName' => $replyUser->getName(),
                    'pp' => $replyUser->getPp(),
                    'blocked' => $replyUser->isBlocked(),
                ],
                'content' => $reply->getContent(),
                'createdAt' => $reply->getCreatedAt()->format('c'),
                'canDelete' => $currentUser && ($currentUser->getId() === $replyUser->getId() || $this->isGranted('ROLE_ADMIN')),
            ];
            $data[] = $replyData;
        }

        return $this->json($data);
    }

    /**
     * POST /api/posts/{id}/replies
     * Create a new reply to a post
     */
    #[Route('/posts/{id}/replies', name: 'api_create_reply', methods: ['POST'])]
    public function createReply(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is blocked
        if ($user->isBlocked()) {
            return $this->json(['error' => 'Votre compte a été bloqué'], Response::HTTP_FORBIDDEN);
        }

        // Verify post exists
        $post = $this->postRepository->find($id);
        if (!$post) {
            return $this->json(['error' => 'Tweet non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Check if post author is blocked
        if ($post->getUser()->isBlocked()) {
            return $this->json(['error' => 'Impossible de répondre à un utilisateur banni'], Response::HTTP_FORBIDDEN);
        }

        // Check if user is blocked by post author or blocks post author
        if ($this->blockedUserRepository->isUserBlocked($post->getUser()->getId(), $user->getId())) {
            return $this->json(['error' => 'Vous êtes bloqué par l\'auteur de ce tweet'], Response::HTTP_FORBIDDEN);
        }

        if ($this->blockedUserRepository->isUserBlocked($user->getId(), $post->getUser()->getId())) {
            return $this->json(['error' => 'Vous avez bloqué l\'auteur de ce tweet'], Response::HTTP_FORBIDDEN);
        }

        // Parse request body
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['content']) || empty(trim($data['content']))) {
            return $this->json(['error' => 'Le contenu de la réponse est requis'], Response::HTTP_BAD_REQUEST);
        }

        $content = trim($data['content']);

        // Validate content length (max 500 characters)
        if (strlen($content) > 500) {
            return $this->json(['error' => 'La réponse ne peut pas dépasser 500 caractères'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($content) < 1) {
            return $this->json(['error' => 'La réponse ne peut pas être vide'], Response::HTTP_BAD_REQUEST);
        }

        // Create new reply
        $reply = new Reply();
        $reply->setPost($post);
        $reply->setUser($user);
        $reply->setContent($content);
        $reply->setCreatedAt(new \DateTime());

        // Persist to database
        $this->entityManager->persist($reply);
        $this->entityManager->flush();

        // Return created reply
        $responseData = [
            'id' => $reply->getId(),
            'postId' => $reply->getPost()->getId(),
            'user' => [
                'id' => $reply->getUser()->getId(),
                'username' => $reply->getUser()->getUser(),
                'displayName' => $reply->getUser()->getName(),
                'pp' => $reply->getUser()->getPp(),
            ],
            'content' => $reply->getContent(),
            'createdAt' => $reply->getCreatedAt()->format('c'),
        ];

        return $this->json($responseData, Response::HTTP_CREATED);
    }

    /**
     * DELETE /api/replies/{id}
     * Delete a reply (only owner or admin can delete)
     */
    #[Route('/replies/{id}', name: 'api_delete_reply', methods: ['DELETE'])]
    public function deleteReply(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Find reply
        $reply = $this->replyRepository->find($id);
        if (!$reply) {
            return $this->json(['error' => 'Reply not found'], Response::HTTP_NOT_FOUND);
        }

        // Check permissions (only owner or admin can delete)
        if ($reply->getUser()->getId() !== $user->getId() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        // Delete reply
        $this->entityManager->remove($reply);
        $this->entityManager->flush();

        return $this->json(['success' => 'Reply deleted'], Response::HTTP_OK);
    }
}
