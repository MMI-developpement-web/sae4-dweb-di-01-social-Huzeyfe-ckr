<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/auth')]
class AuthController extends AbstractController
{
    /**
     * Login - vérifie les identifiants et retourne l'utilisateur
     * POST /api/auth/login
     */
    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    public function login(Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['user']) || !isset($data['password'])) {
            return $this->json(['error' => 'user et password sont requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['user' => $data['user']]);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe (en production, utiliser password_verify)
        if ($user->getPassword() !== $data['password']) {
            return $this->json(['error' => 'Utilisateur ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->isActive()) {
            return $this->json(['error' => 'Compte désactivé'], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'id' => $user->getId(),
            'user' => $user->getUser(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'role' => $user->getRole(),
            'active' => $user->isActive(),
            'phone' => $user->getPhone(),
            'birthDate' => $user->getBirthDate()?->format('Y-m-d'),
            'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Register - crée un nouvel utilisateur
     * POST /api/auth/register
     */
    #[Route('/register', name: 'auth_register', methods: ['POST'])]
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
            'phone' => $user->getPhone(),
            'birthDate' => $user->getBirthDate()?->format('Y-m-d'),
            'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
        ], Response::HTTP_CREATED);
    }
}
