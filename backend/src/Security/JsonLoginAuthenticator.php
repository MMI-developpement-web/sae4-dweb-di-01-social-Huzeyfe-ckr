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
        return $request->getPathInfo() === '/api/auth/login' && $request->isMethod('POST');
    }

    public function authenticate(Request $request): SelfValidatingPassport
    {
        // Decode JSON payload
        $content = $request->getContent();
        $data = json_decode($content, true);

        if (!$data || !isset($data['user']) || !isset($data['password'])) {
            throw new CustomUserMessageAuthenticationException('Invalid credentials.');
        }

        // Load user from database
        $user = $this->userRepository->findOneBy(['user' => $data['user']]);

        if (!$user) {
            throw new CustomUserMessageAuthenticationException('Invalid credentials.');
        }

        // Verify password using the password hasher
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            throw new CustomUserMessageAuthenticationException('Invalid credentials.');
        }

        if (!$user->isActive()) {
            throw new CustomUserMessageAuthenticationException('User account is disabled.');
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
        return new \Symfony\Component\HttpFoundation\JsonResponse([
            'error' => 'Invalid credentials.',
            'message' => $exception->getMessage(),
        ], Response::HTTP_UNAUTHORIZED);
    }
}
