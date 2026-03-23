<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\Follow;
use App\Repository\UserRepository;
use App\Repository\FollowRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/users')]
class UserController extends AbstractController
{
    /**
     * Récupère plusieurs utilisateurs (exclut les admins pour les requêtes publiques)
     */
    #[Route('', name: 'users.all', methods: ['GET'])]
    public function all(UserRepository $userRepository): JsonResponse
    {
        // Exclure les comptes admin
        $users = $userRepository->createQueryBuilder('u')
            ->where('u.role != :admin')
            ->setParameter('admin', 'admin')
            ->orderBy('u.id', 'ASC')
            ->getQuery()
            ->getResult();

        $usersArray = array_map(function (User $u) {
            return [
                'id' => $u->getId(),
                'user' => $u->getUser(),
                'email' => $u->getEmail(),
                'name' => $u->getName(),
                'role' => $u->getRole(),
                'active' => $u->isActive(),
                'phone' => $u->getPhone(),
                'birthDate' => $u->getBirthDate() ? $u->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $u->getCreatedAt() ? $u->getCreatedAt()->format(DATE_ATOM) : null,
            ];
        }, $users);

        return $this->json(['users' => $usersArray]);
    }

    /**
     * Récupère un utilisateur spécifique
     */
    #[Route('/{id}', name: 'users.get', methods: ['GET'])]
    public function get(User $user, FollowRepository $followRepository): JsonResponse
    {
        $currentUser = $this->getUser();
        
        $u = [
            'id' => $user->getId(),
            'user' => $user->getUser(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => $user->getRole(),
            'active' => $user->isActive(),
            'phone' => $user->getPhone(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format(DATE_ATOM) : null,
            'followers' => $followRepository->countFollowers($user->getId()),
            'following' => $followRepository->countFollowing($user->getId()),
            'isFollowing' => false,
        ];

        // Vérifier si l'utilisateur courant suit cet utilisateur
        if ($currentUser instanceof User && $currentUser->getId() !== $user->getId()) {
            $follow = $followRepository->findByFollowerAndFollowing($currentUser->getId(), $user->getId());
            $u['isFollowing'] = $follow !== null;
        }

        return $this->json($u);
    }

    /**
     * Création d'un utilisateur
     */
    #[Route('', name: 'users.create', methods: ['POST'])]
    public function create(Request $request, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['user']) || !isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            return $this->json(['error' => 'user, email, password et name sont requis'], Response::HTTP_BAD_REQUEST);
        }

        if ($userRepository->findOneBy(['user' => $data['user']])) {
            return $this->json(['error' => 'Utilisateur existant'], Response::HTTP_CONFLICT);
        }

        if ($userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Email déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setUser($data['user']);
        $user->setEmail($data['email']);
        $user->setPassword($data['password']);
        $user->setName($data['name']);
        $user->setRole($data['role'] ?? 'user');
        $user->setActive($data['active'] ?? true);
        $user->setCreatedAt(new \DateTime());

        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        if (isset($data['birthDate'])) {
            $user->setBirthDate(new \DateTime($data['birthDate']));
        }

        $em->persist($user);
        $em->flush();

        return $this->json(['id' => $user->getId()], Response::HTTP_CREATED);
    }

    /**
     * Remplace un utilisateur (PUT)
     */
    #[Route('/{id}', name: 'users.update', methods: ['PUT'])]
    public function update(User $user, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Remplacement total supposé : vérifier la présence des champs obligatoires
        if (!isset($data['user']) || !isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            return $this->json(['error' => 'user, email, password et name sont requis'], Response::HTTP_BAD_REQUEST);
        }

        $user->setUser($data['user']);
        $user->setEmail($data['email']);
        $user->setPassword($data['password']);
        $user->setName($data['name']);
        $user->setRole($data['role'] ?? $user->getRole());
        $user->setActive($data['active'] ?? $user->isActive());

        $user->setPhone($data['phone'] ?? null);
        $user->setBirthDate(isset($data['birthDate']) ? new \DateTime($data['birthDate']) : null);

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'user' => $user->getUser(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => $user->getRole(),
            'active' => $user->isActive(),
            'phone' => $user->getPhone(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format(DATE_ATOM) : null,
        ]);
    }

    /**
     * Patch partiel d'un utilisateur (PATCH)
     */
    #[Route('/{id}', name: 'users.patch', methods: ['PATCH'])]
    public function patch(User $user, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $user->setName($data['name']);
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }
        if (isset($data['birthDate'])) {
            $user->setBirthDate(new \DateTime($data['birthDate']));
        }
        if (isset($data['active'])) {
            $user->setActive($data['active']);
        }
        if (isset($data['role'])) {
            $user->setRole($data['role']);
        }

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'user' => $user->getUser(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => $user->getRole(),
            'active' => $user->isActive(),
            'phone' => $user->getPhone(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format(DATE_ATOM) : null,
        ]);
    }

    /**
     * Supprime un utilisateur
     */
    #[Route('/{id}', name: 'users.delete', methods: ['DELETE'])]
    public function delete(User $user, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Utilisateur supprimé'], Response::HTTP_NO_CONTENT);
    }

    /**
     * Suive un utilisateur
     * POST /api/users/{id}/follow
     */
    #[Route('/{id}/follow', name: 'users.follow', methods: ['POST'])]
    public function follow(User $userToFollow, FollowRepository $followRepository, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if ($currentUser->getId() === $userToFollow->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas vous suivre vous-même'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si déjà suivi
        $existingFollow = $followRepository->findByFollowerAndFollowing($currentUser->getId(), $userToFollow->getId());
        if ($existingFollow) {
            return $this->json(['error' => 'Vous suivez déjà cet utilisateur'], Response::HTTP_CONFLICT);
        }

        // Créer la relation Follow
        $follow = new Follow();
        $follow->setFollower($currentUser);
        $follow->setFollowing($userToFollow);

        $em->persist($follow);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur suivi',
            'followers' => $followRepository->countFollowers($userToFollow->getId()),
            'following' => $followRepository->countFollowing($userToFollow->getId()),
        ], Response::HTTP_CREATED);
    }

    /**
     * Arrête de suivre un utilisateur
     * DELETE /api/users/{id}/follow
     */
    #[Route('/{id}/follow', name: 'users.unfollow', methods: ['DELETE'])]
    public function unfollow(User $userToUnfollow, FollowRepository $followRepository, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Trouver la relation Follow
        $follow = $followRepository->findByFollowerAndFollowing($currentUser->getId(), $userToUnfollow->getId());
        if (!$follow) {
            return $this->json(['error' => 'Vous ne suivez pas cet utilisateur'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($follow);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur désuivi',
            'followers' => $followRepository->countFollowers($userToUnfollow->getId()),
            'following' => $followRepository->countFollowing($userToUnfollow->getId()),
        ]);
    }
}
