<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\TokenService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/auth')]
class AuthController extends AbstractController
{
    /**
     * Login - Endpoint that receives JSON credentials and returns access token
     * POST /api/auth/login
     */
    #[Route('/login', name: 'auth_login', methods: ['POST'], format: 'json')]
    public function login(
        Request $request, 
        UserRepository $userRepository, 
        UserPasswordHasherInterface $passwordHasher,
        TokenService $tokenService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validate input
        if (!isset($data['user']) || !isset($data['password'])) {
            return $this->json(
                ['error' => 'user et password sont requis'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Load user from database
        $user = $userRepository->findOneBy(['user' => $data['user']]);

        if (!$user) {
            return $this->json(['error' => 'Identifiant ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        // Verify password
        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiant ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->isBlocked()) {
            return $this->json(['error' => 'Ce compte a été bloqué'], Response::HTTP_UNAUTHORIZED);
        }

        // Generate access token (7 days expiration)
        $expiresAt = (new \DateTimeImmutable())->modify('+7 days');
        $accessToken = $tokenService->generateToken($user, $expiresAt);

        return $this->json([
            'token' => $accessToken,
            'user' => [
                'id' => $user->getId(),
                'user' => $user->getUser(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'role' => $user->getRole(),
                'blocked' => $user->isBlocked(),
                'readOnly' => $user->isReadOnly(),
                'pinnedPostIds' => $user->getPinnedPosts()->map(fn(Post $p) => $p->getId())->toArray(),
            ],
        ]);
    }

    /**
     * Register - Creates a new user account
     * POST /api/auth/register
     */
    #[Route('/register', name: 'auth_register', methods: ['POST'], format: 'json')]
    public function register(Request $request, UserRepository $userRepository, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher, TokenService $tokenService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation des champs requis
        if (!isset($data['user']) || !isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            return $this->json(
                ['error' => 'user, email, password et name sont requis'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Vérifier si l'utilisateur existe déjà
        $existingUser = $userRepository->findOneBy(['user' => $data['user']]);
        if ($existingUser) {
            return $this->json(['error' => 'Cet utilisateur existe déjà'], Response::HTTP_CONFLICT);
        }

        // Vérifier si l'email existe déjà
        $existingEmail = $userRepository->findOneBy(['email' => $data['email']]);
        if ($existingEmail) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        // Créer le nouvel utilisateur
        $user = new User();
        $user->setUser($data['user']);
        $user->setEmail($data['email']);
        // Hacher le mot de passe de manière sécurisée
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        $user->setName($data['name']);
        $user->setRole('user'); // Par défaut, nouveau utilisateur = user
        $user->setBlocked(false);
        $user->setCreatedAt(new \DateTime());

        // Champs optionnels
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        if (isset($data['birthDate'])) {
            $user->setBirthDate(new \DateTime($data['birthDate']));
        }

        $em->persist($user);
        $em->flush();

        // Generate access token (7 days expiration) like in login
        $expiresAt = (new \DateTimeImmutable())->modify('+7 days');
        $accessToken = $tokenService->generateToken($user, $expiresAt);

        return $this->json([
            'token' => $accessToken,
            'user' => [
                'id' => $user->getId(),
                'user' => $user->getUser(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'role' => $user->getRole(),
                'blocked' => $user->isBlocked(),
                'readOnly' => $user->isReadOnly(),
                'pinnedPostIds' => $user->getPinnedPosts()->map(fn(Post $p) => $p->getId())->toArray(),
            ],
        ], Response::HTTP_CREATED);
    }
}
