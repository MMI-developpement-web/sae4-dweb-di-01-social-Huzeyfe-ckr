<?php

// ce fichier gère l'authentification via JSON Login et délègue la génération de token au LoginSuccessHandler

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\UserRepository;

class JsonLoginAuthenticator extends AbstractAuthenticator
{
    private UserRepository $userRepository;
    private LoginSuccessHandler $loginSuccessHandler;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserRepository $userRepository, LoginSuccessHandler $loginSuccessHandler, UserPasswordHasherInterface $passwordHasher)
    {
        $this->userRepository = $userRepository;
        $this->loginSuccessHandler = $loginSuccessHandler;
        $this->passwordHasher = $passwordHasher;
    }

    public function supports(Request $request): ?bool
    {
        // Check if it's a POST request to /api/auth/login (with more flexible path matching)
        $pathInfo = $request->getPathInfo();
        $isLoginPath = str_ends_with($pathInfo, '/api/auth/login') || $pathInfo === '/api/auth/login';
        return $isLoginPath && $request->isMethod('POST');
    }

    public function authenticate(Request $request): SelfValidatingPassport
    {
        // Decode JSON payload
        $content = $request->getContent();
        $data = json_decode($content, true);

        if (!$data || !isset($data['user']) || !isset($data['password'])) {
            throw new CustomUserMessageAuthenticationException('Identifiant ou mot de passe incorrect');
        }

        // Load user from database
        $user = $this->userRepository->findOneBy(['user' => $data['user']]);

        if (!$user) {
            throw new CustomUserMessageAuthenticationException('Identifiant ou mot de passe incorrect');
        }

        // Verify password using the password hasher
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            throw new CustomUserMessageAuthenticationException('Identifiant ou mot de passe incorrect');
        }

        if (!$user->isActive()) {
            throw new CustomUserMessageAuthenticationException('Ce compte a été désactivé');
        }

        if ($user->isBlocked()) {
            throw new CustomUserMessageAuthenticationException('Votre compte a été bloqué pour non-respect des conditions d\'utilisation');
        }

        // Return self-validating passport (we already validated)
        return new SelfValidatingPassport(
            new UserBadge($user->getUserIdentifier())
        );
    }

    // Note: Success handler is now delegated to LoginSuccessHandler
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // Delegate to LoginSuccessHandler to generate and return the access token
        return $this->loginSuccessHandler->onAuthenticationSuccess($request, $token);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        // Utiliser le message complet de l'exception pour afficher des messages d'erreur spécifiques
        $message = $exception->getMessage();
        if (empty($message) || $message === 'Invalid credentials.') {
            $message = 'Identifiant ou mot de passe incorrect';
        }
        
        return new \Symfony\Component\HttpFoundation\JsonResponse([
            'error' => $message,
            'message' => $message,
        ], Response::HTTP_UNAUTHORIZED);
    }
}
