<?php

namespace App\Security;

use App\Service\TokenService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

class LoginSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function __construct(private TokenService $tokenService)
    {
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): Response
    {
        $user = $token->getUser();

        // Générer un token avec expiration de 7 jours
        $expiresAt = (new \DateTimeImmutable())->modify('+7 days');
        $accessToken = $this->tokenService->generateToken($user, $expiresAt);

        return new JsonResponse([
            'token' => $accessToken,
            'user' => [
                'id' => $user->getId(),
                'user' => $user->getUser(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'role' => $user->getRole(),
                'blocked' => $user->isBlocked(),
            ],
        ]);
    }
}

