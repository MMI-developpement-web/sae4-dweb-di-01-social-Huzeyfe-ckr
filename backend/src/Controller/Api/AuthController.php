<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/auth')]
class AuthController extends AbstractController
{
    /**
     * Login - Endpoint that receives JSON credentials and returns JWT token
     * This route is handled by the JSON Login authenticator configured in security.yaml
     * POST /api/auth/login
     * 
     * Note: This endpoint is intercepted by the firewall's JSON Login authenticator.
     * The authenticator validates credentials and calls LoginSuccessHandler to generate JWT.
     * This action exists primarily for routing/documentation purposes.
     */
    #[Route('/login', name: 'auth_login', methods: ['POST'], format: 'json')]
    public function login(): Response
    {
        // This method should never actually execute because the Security firewall intercepts the request
        // before it reaches this controller action and handles it via JSON Login.
        // If we get here, just return a 200 OK - the real response is handled by LoginSuccessHandler.
        return $this->json([
            'message' => 'Login successful - handled by security firewall'
        ]);
    }

    /**
     * Register - Creates a new user account
     * POST /api/auth/register
     */
    #[Route('/register', name: 'auth_register', methods: ['POST'], format: 'json')]
    public function register(Request $request, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
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
        $user->setPassword($data['password']); // En production, utiliser password_hash
        $user->setName($data['name']);
        $user->setRole('user'); // Par défaut, nouveau utilisateur = user
        $user->setActive(true);
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

        return $this->json([
            'id' => $user->getId(),
            'user' => $user->getUser(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => $user->getRole(),
            'active' => $user->isActive(),
        ], Response::HTTP_CREATED);
    }
}
