<?php

namespace App\Controller\Api;

use App\Entity\BlockedUser;
use App\Repository\BlockedUserRepository;
use App\Repository\UserRepository;
use App\Repository\FollowRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class BlockController extends AbstractController
{
    public function __construct(
        private BlockedUserRepository $blockedUserRepository,
        private UserRepository $userRepository,
        private FollowRepository $followRepository,
        private EntityManagerInterface $entityManager,
    ) {}

    /**
     * POST /api/users/{id}/block
     * Block a user
     */
    #[Route('/users/{id}/block', name: 'api_block_user', methods: ['POST'])]
    public function blockUser(int $id): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Cannot block yourself
        if ($currentUser->getId() === $id) {
            return $this->json(['error' => 'Cannot block yourself'], Response::HTTP_BAD_REQUEST);
        }

        // Verify target user exists
        $userToBlock = $this->userRepository->find($id);
        if (!$userToBlock) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Block the user
        $this->blockedUserRepository->blockUser($currentUser->getId(), $id);

        // Unfollow if following
        $follow = $this->followRepository->findOneBy([
            'follower' => $currentUser,
            'following' => $userToBlock,
        ]);
        if ($follow) {
            $this->entityManager->remove($follow);
            $this->entityManager->flush();
        }

        return $this->json(['success' => 'User blocked'], Response::HTTP_OK);
    }

    /**
     * DELETE /api/users/{id}/block
     * Unblock a user
     */
    #[Route('/users/{id}/block', name: 'api_unblock_user', methods: ['DELETE'])]
    public function unblockUser(int $id): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Verify target user exists
        $userToUnblock = $this->userRepository->find($id);
        if (!$userToUnblock) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Unblock the user
        $success = $this->blockedUserRepository->unblockUser($currentUser->getId(), $id);

        if (!$success) {
            return $this->json(['error' => 'User was not blocked'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json(['success' => 'User unblocked'], Response::HTTP_OK);
    }

    /**
     * GET /api/users/{id}/blocked-users
     * Get list of users blocked by a specific user
     */
    #[Route('/users/{id}/blocked-users', name: 'api_get_blocked_users', methods: ['GET'])]
    public function getBlockedUsers(int $id): JsonResponse
    {
        // Verify user exists
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Get current user to check if they can view this
        $currentUser = $this->getUser();

        // Only allow viewing own blocked list or admin
        if (!$currentUser || ($currentUser->getId() !== $id && !$this->isGranted('ROLE_ADMIN'))) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        // Get blocked users
        $blockedUsers = $this->blockedUserRepository->findBlockedByUser($id);

        $data = [];
        foreach ($blockedUsers as $blockedUser) {
            $data[] = [
                'id' => $blockedUser->getBlockedUser()->getId(),
                'username' => $blockedUser->getBlockedUser()->getUser(),
                'displayName' => $blockedUser->getBlockedUser()->getName(),
                'pp' => $blockedUser->getBlockedUser()->getPp(),
                'blockedAt' => $blockedUser->getCreatedAt()->format('c'),
            ];
        }

        return $this->json($data);
    }

    /**
     * GET /api/users/{id}/is-blocked
     * Check if current user has blocked a specific user
     */
    #[Route('/users/{id}/is-blocked', name: 'api_is_user_blocked', methods: ['GET'])]
    public function isUserBlocked(int $id): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Verify target user exists
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $isBlocked = $this->blockedUserRepository->isUserBlocked($currentUser->getId(), $id);

        return $this->json([
            'isBlocked' => $isBlocked,
            'userId' => $id,
        ]);
    }
}
